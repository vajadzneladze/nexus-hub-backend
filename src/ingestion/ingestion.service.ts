import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { AssetsGateway } from 'src/assets/assets.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
@Injectable()
export class IngestionService implements OnModuleInit {

  // Logger-ი გვეხმარება პრობლემის სწრაფად პოვნაში
  private readonly logger = new Logger(IngestionService.name);

  // აქტივების სია, რომლის მონიტორინგიც გვინდა
  private readonly trackedSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
  // Cron შეიძლება დაიძრას მაშინაც, როცა წინა sync ჯერ არ დასრულებულა.
  // ეს ფლაგი გვიცავს overlap-ისგან (single-process lock).
  private isSyncRunning = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly assetsGateway: AssetsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }
  // აპლიკაციის ჩართვისთანავე ვუშვებთ ერთხელ, რომ ბაზა ცარიელი არ იყოს
  async onModuleInit() {
    this.logger.log('Initializing data ingestion...');
    await this.fetchAndStorePrices();
  }

  // ყოველ 5 წამში ერთხელ ვამოწმებთ ბაზარს.
  // თუ წინა ციკლი ჯერ არ დასრულებულა, ახალს ვტოვებთ (skip) რათა:
  // 1) არ დაგროვდეს parallel load
  // 2) ერთსა და იმავე candle-ზე ზედმეტი race არ მივიღოთ
  @Cron('*/5 * * * * *')
  async handleCron() {
    await this.fetchAndStorePrices();
  }

  private async fetchAndStorePrices() {
    if (this.isSyncRunning) {
      this.logger.warn('Skipping ingestion tick because previous sync is still running.');
      return;
    }

    this.isSyncRunning = true;
    try {
      for (const symbol of this.trackedSymbols) {
        try {
          // 1) Fetching data from Binance with timeout + retry
          // Node-ში გარე HTTP call არის ყველაზე მყიფე ნაწილი.
          // ამიტომ ვიყენებთ მცირე retry-ს transient ქსელურ შეცდომებზე.
          const data = await this.fetchTickerWithRetry(symbol);

          // 2) Data Validation & Transformation
          // Binance-დან ბევრი ველი მოდის სტრიქონად, ჩვენ კი ბაზაში რიცხვები გვჭირდება
          const savedData = await this.storeInDatabase(data);
          await this.cacheManager.set(`latest_price_${symbol}`, savedData);
          this.assetsGateway.broadcastPrice(symbol, savedData);
        } catch (error: any) {
          // Bug-Free მიდგომა: ერთი კრიპტოს შეცდომამ სხვა არ უნდა გააჩეროს
          this.logger.error(
            `Failed to sync ${symbol}: ${error?.response?.data?.msg || error?.message || 'unknown error'}`,
          );
        }
      }
    } finally {
      // finally აუცილებელია: throw/error-ის შემთხვევაშიც lock უნდა გათავისუფლდეს.
      this.isSyncRunning = false;
    }
  }

  private async fetchTickerWithRetry(symbol: string) {
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { data } = await firstValueFrom(
          this.httpService.get(url, { timeout: 5000 }),
        );
        return data;
      } catch (error: any) {
        const canRetry = this.isRetryableNetworkError(error);
        const isLastAttempt = attempt === maxAttempts;
        if (!canRetry || isLastAttempt) {
          throw error;
        }

        // exponential-ish backoff: 300ms, 600ms
        await this.sleep(300 * attempt);
      }
    }
  }

  // Retry მხოლოდ transient network პრობლემებზეა აზრიანი.
  // მაგალითად DNS/timeout/reset შემთხვევები ხშირად დროებითია.
  private isRetryableNetworkError(error: any) {
    const code = error?.code as string | undefined;
    return ['ECONNRESET', 'ECONNABORTED', 'ENOTFOUND', 'ETIMEDOUT'].includes(code ?? '');
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async storeInDatabase(apiData: any) {
    // დამხმარე ფუნქცია 4 ციფრამდე დასამრგვალებლად
    const trim = (value: string | number) => Number(Number(value).toFixed(4));
    const whereUnique = {
      symbol_timestamp: {
        symbol: apiData.symbol,
        timestamp: BigInt(apiData.closeTime),
      },
    };

    try {
      // რატომ არა პირდაპირ upsert:
      // რეალურ გარემოში (cron + startup fetch + network jitter) ერთი და იგივე candle
      // შეიძლება პარალელურად დამუშავდეს. ასეთ დროს create იღებს race-ს და P2002-ს აგდებს.
      // ქვემოთ fallback-ს ვაკეთებთ, რომ უკვე არსებული ჩანაწერი დავაბრუნოთ მშვიდად.
      return await this.prisma.asset.create({
        data: {
          symbol: apiData.symbol,
          // აი აქ ვიყენებთ ჩვენს "ჩამომჭრელ" ფუნქციას
          lastPrice: trim(apiData.lastPrice),
          priceChangePercent: trim(apiData.priceChangePercent),
          highPrice: trim(apiData.highPrice),
          lowPrice: trim(apiData.lowPrice),
          volume: trim(apiData.volume),
          quoteVolume: trim(apiData.quoteVolume),
          count: apiData.count,
          timestamp: BigInt(apiData.closeTime),
          source: 'Binance',
        },
      });
    } catch (error: any) {
      // P2002 = Unique constraint violation (symbol + timestamp უკვე არსებობს)
      // ეს case ingestion-ისთვის მოსალოდნელია და error-ად არ უნდა ჩაითვალოს.
      if (error?.code === 'P2002') {
        return this.prisma.asset.findUnique({ where: whereUnique });
      }
      throw error;
    }
  }
}