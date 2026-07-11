import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'Haircut', description: 'Service title', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (value as string)?.trim())
  title: string;

  @ApiPropertyOptional({ example: 'A classic haircut with wash and blow-dry', description: 'Optional description' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string)?.trim())
  description?: string;

  @ApiProperty({ example: 30, description: 'Duration in minutes (integer)', minimum: 1 })
  @IsInt({ message: 'Duration must be a whole number (minutes)' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  @Type(() => Number)
  duration: number;

  @ApiProperty({ example: 250.00, description: 'Price (up to 2 decimal places)', minimum: 0 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with up to 2 decimal places' },
  )
  @Min(0, { message: 'Price cannot be negative' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: true, default: true, description: 'Set to false to deactivate the service' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
