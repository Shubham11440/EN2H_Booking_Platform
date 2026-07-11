import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Haircut & Styling', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (value as string)?.trim())
  title?: string;

  @ApiPropertyOptional({ example: 'Premium cut, wash, and style' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string)?.trim())
  description?: string;

  @ApiPropertyOptional({ example: 45, description: 'Duration in minutes', minimum: 1 })
  @IsOptional()
  @IsInt({ message: 'Duration must be a whole number (minutes)' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({ example: 350.00, minimum: 0 })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with up to 2 decimal places' },
  )
  @Min(0, { message: 'Price cannot be negative' })
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: true, description: 'Toggle service availability' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
