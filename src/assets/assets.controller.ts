import { Controller, Get, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { GetHistoryDto } from './dto/get-history.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * აბრუნებს უახლეს (Cached) ფასს კონკრეტული სიმბოლოსთვის.
   * GET /assets/latest?symbol=BTCUSDT
   */
  @Get('latest')
  async getLatest(@Query('symbol') symbol: string = 'BTCUSDT') {
    // ყოველთვის ვაკეთებთ toUpperCase-ს, რომ ბაზაში ძებნა იყოს სტაბილური
    return this.assetsService.getLatestPrice(symbol.toUpperCase());
  }

  /**
   * აბრუნებს ისტორიულ მონაცემებს ვალიდაციით.
   * GET /assets/history?symbol=BTCUSDT&limit=20
   */
  @Get('history')
  @UsePipes(new ValidationPipe({ transform: true })) // ავტომატური კონვერტაცია (მაგ: "20" -> 20)
  async getHistory(@Query() query: GetHistoryDto) {
    return this.assetsService.getHistory(query.symbol ?? 'BTCUSDT', query.limit);
  }

  /**
   * ბოლო 20 ჩანაწერი ზოგადი მონიტორინგისთვის.
   */
  @Get()
  async findAll() {
    return this.assetsService.findAll();
  }
}