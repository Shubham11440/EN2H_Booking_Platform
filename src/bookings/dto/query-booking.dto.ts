import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class QueryBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus, {
    message: `status must be one of: ${Object.values(BookingStatus).join(', ')}`,
  })
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  search?: string; // matches against customerName or customerEmail

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
