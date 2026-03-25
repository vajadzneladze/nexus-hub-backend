import { Controller, Get, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets') // ეს ნიშნავს, რომ მისამართი იქნება localhost:3000/assets
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get() // GET რექვესთი ყველა აქტივის სანახავად
  findAll() {
    return this.assetsService.findAll();
  }

  @Get('history') // localhost:3000/assets/history?symbol=BTCUSDT
  getHistory(@Query('symbol') symbol: string) {
    return this.assetsService.getHistory(symbol);
  }
}