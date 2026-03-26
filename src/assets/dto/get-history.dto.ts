import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetHistoryDto {
    @IsString()
    @IsOptional()
    symbol?: string = 'BTCUSDT';

    @IsInt()
    @IsOptional()
    @Min(5)
    @Max(100)
    @Type(() => Number)
    limit?: number = 50;
}