import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Nest-ის request lifecycle-ში Pipe მუშაობს Controller-მდე:
  // 1) incoming JSON-ს გარდაქმნის DTO class instance-ად (transform)
  // 2) DTO დეკორატორებით ამოწმებს ველებს (class-validator)
  // 3) whitelist=true ტოვებს მხოლოდ ნებადართულ ველებს
  // 4) forbidNonWhitelisted=true აბრუნებს 400-ს ზედმეტი ველებისას
  // ეს გვიცავს mass-assignment/არასასურველი payload-ისგან.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ეს ეუბნება JavaScript-ს, რომ BigInt ყოველთვის სტრიქონად გადააქციოს JSON-ში
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
