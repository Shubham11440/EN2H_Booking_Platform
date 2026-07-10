import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Public — customers create bookings without logging in
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  // Auth-guarded — only staff can view all bookings
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryBookingDto) {
    return this.bookingsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findOne(id);
  }

  // PATCH /bookings/:id/status — explicit sub-resource keeps status updates
  // separate from a generic PATCH so intent is unambiguous
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  // DELETE /bookings/:id → sets status to CANCELLED (soft operation)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.cancel(id);
  }
}
