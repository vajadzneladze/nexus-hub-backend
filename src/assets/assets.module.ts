import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AssetsGateway } from './assets.gateway';

@Module({
  // კონტროლერი პასუხისმგებელია HTTP რექვესთებზე
  controllers: [AssetsController],
  // სერვისი პასუხისმგებელია ბიზნეს ლოგიკაზე
  providers: [AssetsService, AssetsGateway],
  // ექსპორტი საჭიროა, თუ სხვა მოდულს დასჭირდება AssetsService
  exports: [AssetsService, AssetsGateway],
})
export class AssetsModule {}