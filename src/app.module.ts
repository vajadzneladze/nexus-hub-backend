import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { ScheduleModule } from '@nestjs/schedule';
import { IngestionModule } from './ingestion/ingestion.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    // Throttling = request burst-ის კონტროლი HTTP ფენაზე.
    // Nest-ში ამას ვრთავთ module დონეზე და global guard-ით ვავრცელებთ ყველა route-ზე.
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
    }),
    IngestionModule,
    TasksModule,
    PrismaModule,
    AssetsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard არის execution boundary (Pipe-მდე/Controller-მდე),
    // ამიტომ security/traffic წესების ცენტრალიზებისთვის ეს არის სწორი ადგილი.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
