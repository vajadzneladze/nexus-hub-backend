import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function parseCorsOrigins(raw: string | undefined) {
  if (!raw?.trim()) {
    // Node/Nest-ში CORS "open by default" ცუდი პრაქტიკაა.
    // Local dev-სთვის უსაფრთხო default ვტოვებთ მხოლოდ ცნობილ localhost origin-ებზე.
    return ['http://localhost:3000', 'http://localhost:5173'];
  }
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS არის browser-ის უსაფრთხოების კონტროლი cross-origin request-ებზე.
  // Nest-ში enableCors() გვაძლევს ერთ წერტილს, სადაც origin policy-ს ვაკონტროლებთ.
  app.enableCors({
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: true,
  });

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
