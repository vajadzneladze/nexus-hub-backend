import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  // DTO (Data Transfer Object) არის API კონტრაქტი:
  // HTTP payload ჯერ ამ კლასში "მოხვდება" და მერე გაეშვება service-ში.
  // ამით validation ცენტრალიზდება და ბიზნეს-ლოგიკას სუფთად ვტოვებთ.
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // categoryName დროებით plain string-ია.
  // შემდეგ ეტაპზე შეგვიძლია enum/slug policy ან dedicated Category DTO-ც.
  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoryName?: string;
}