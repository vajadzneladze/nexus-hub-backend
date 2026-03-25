import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ეს ხაზი ნიშნავს, რომ ყველა სხვა მოდული ავტომატურად ხედავს პრიზმას
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // აუცილებელია ექსპორტი, რომ სხვებმა გამოიყენონ
})
export class PrismaModule {}