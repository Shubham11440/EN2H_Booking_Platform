import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Shubh Sharma', description: 'Full name of the user', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (value as string)?.trim())
  name: string;

  @ApiProperty({ example: 'shubh@example.com', description: 'Email address (must be unique)' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => (value as string)?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password — minimum 8 characters', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
