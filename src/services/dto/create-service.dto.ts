import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (value as string)?.trim())
  title: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string)?.trim())
  description?: string;

  @IsInt({ message: 'Duration must be a whole number (minutes)' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  @Type(() => Number)
  duration: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with up to 2 decimal places' },
  )
  @Min(0, { message: 'Price cannot be negative' })
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
