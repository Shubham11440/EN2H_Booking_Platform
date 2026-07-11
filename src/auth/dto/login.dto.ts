import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'shubh@example.com', description: 'Registered email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => (value as string)?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'password123', description: 'Account password', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
