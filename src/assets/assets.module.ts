import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AssetsGateWay } from './assets.gateway';

@Module({
  // კონტროლერი პასუხისმგებელია HTTP რექვესთებზე
  controllers: [AssetsController],
  // სერვისი პასუხისმგებელია ბიზნეს ლოგიკაზე
  providers: [AssetsService, AssetsGateWay],
  // ექსპორტი საჭიროა, თუ სხვა მოდულს დასჭირდება AssetsService
  exports: [AssetsService, AssetsGateWay],
})
export class AssetsModule {}