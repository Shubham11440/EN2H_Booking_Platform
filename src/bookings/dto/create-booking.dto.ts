import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'John Doe', description: 'Full name of the customer', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (value as string)?.trim())
  customerName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Customer email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => (value as string)?.toLowerCase().trim())
  customerEmail: string;

  @ApiPropertyOptional({ example: '+91-9876543210', description: 'Customer phone number (optional)', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'UUID of the service to book' })
  @IsUUID('4', { message: 'serviceId must be a valid UUID' })
  serviceId: string;

  @ApiProperty({ example: '2026-08-01', description: 'Booking date in YYYY-MM-DD format — cannot be in the past' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'bookingDate must be in YYYY-MM-DD format',
  })
  bookingDate: string;

  @ApiProperty({ example: '10:00', description: 'Booking time in HH:MM format (24-hour)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'bookingTime must be in HH:MM format (e.g. 09:00, 14:30)',
  })
  bookingTime: string;

  @ApiPropertyOptional({ example: 'Please use organic products', description: 'Additional notes or requests' })
  @IsOptional()
  @IsString()
  notes?: string;
}
