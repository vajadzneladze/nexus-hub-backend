import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IngestionService } from './ingestion.service';
import { AssetsModule } from 'src/assets/assets.module';

@Module({
  imports: [HttpModule, AssetsModule], // აუცილებელია Axios-ისთვის
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}