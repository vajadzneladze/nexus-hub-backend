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

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly assetsGateway: AssetsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }
    // აპლიკაციის ჩართვისთანავე ვუშვებთ ერთხელ, რომ ბაზა ცარიელი არ იყოს
    async onModuleInit() {
      this.logger.log('🚀 Initializing Data Ingestion...');
      await this.fetchAndStorePrices();
    }

// ყოველ 50 წამში გამოიძახება ეს ფუნქცია
// @Cron('*/50 * * * * *') - ყოველ 50 წამში
@Cron('*/5 * * * * *')
async handleCron() {
  await this.fetchAndStorePrices();
}

  private async fetchAndStorePrices() {
  for (const symbol of this.trackedSymbols) {
    try {
      // 1. Fetching data from Binance
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
      const { data } = await firstValueFrom(this.httpService.get(url));

      // 2. Data Validation & Transformation
      // Binance-დან ბევრი ველი მოდის სტრიქონად, ჩვენ კი ბაზაში რიცხვები გვჭირდება
      const savedData = await this.storeInDatabase(data);
      await this.cacheManager.set(`latest_price_${symbol}`, savedData);
      // this.logger.log('📢 Broadcasting to Sockets...'); // ჩაამატე ეს ლოგი შესამოწმებლად
      this.assetsGateway.broadcastPrice(symbol, savedData);
      // this.logger.debug(`✅ Sync successful for ${symbol}: ${data.lastPrice}`);
    } catch (error) {
      // Bug-Free მიდგომა: ერთი კრიპტოს შეცდომამ სხვა არ უნდა გააჩეროს
      this.logger.error(
        `❌ Failed to sync ${symbol}: ${error.response?.data?.msg || error.message}`
      );
    }
  }
}

  private async storeInDatabase(apiData: any) {
  // დამხმარე ფუნქცია 4 ციფრამდე დასამრგვალებლად
  const trim = (value: string | number) => Number(Number(value).toFixed(4));

  return await this.prisma.asset.upsert({
    where: {
      symbol_timestamp: {
        symbol: apiData.symbol,
        timestamp: BigInt(apiData.closeTime),
      },
    },
    update: {},
    create: {
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
}
}