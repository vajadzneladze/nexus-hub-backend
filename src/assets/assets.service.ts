import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  // ყველა აქტივის ბოლო 20 ჩანაწერი
  async findAll() {
    return this.prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // კონკრეტული სიმბოლოს ისტორია (მაგ. ბოლო 50 ფასი)
  async getHistory(symbol: string) {
    return this.prisma.asset.findMany({
      where: {
        symbol: symbol || 'BTCUSDT', // თუ სიმბოლო არ გადმოგვცეს, აიღოს BTC
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
    });
  }
}