import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (value as string)?.trim())
  customerName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => (value as string)?.toLowerCase().trim())
  customerEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string;

  @IsUUID('4', { message: 'serviceId must be a valid UUID' })
  serviceId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'bookingDate must be in YYYY-MM-DD format',
  })
  bookingDate: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'bookingTime must be in HH:MM format (e.g. 09:00, 14:30)',
  })
  bookingTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
