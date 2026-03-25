import { Controller, Get, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets') // მისამართი: localhost:3000/assets
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // აბრუნებს ყველა აქტივის ბოლო მონაცემებს
  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  // აბრუნებს კონკრეტული კრიპტოს ისტორიას
  // მაგალითად: localhost:3000/assets/history?symbol=BTCUSDT
  @Get('history')
  getHistory(@Query('symbol') symbol: string) {
    return this.assetsService.getHistory(symbol);
  }
}