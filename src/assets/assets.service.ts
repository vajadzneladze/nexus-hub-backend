import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async getLatestPrice(symbol: string) {
    const cacheKey = `latest_price_${symbol}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const latest = await this.prisma.asset.findFirst({
      where: { symbol },
      orderBy: { timestamp: 'desc' },
    })

    if (latest) {
      await this.cacheManager.set(cacheKey, latest);
    }

    return latest;
  }

  // ყველა აქტივის ბოლო 20 ჩანაწერი
  async findAll() {
    return this.prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // კონკრეტული სიმბოლოს ისტორია (მაგ. ბოლო 50 ფასი)
  async getHistory(symbol: string, limit: number = 50) {
    return this.prisma.asset.findMany({
      where: {
        symbol: symbol || 'BTCUSDT', // თუ სიმბოლო არ გადმოგვცეს, აიღოს BTC
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }
}