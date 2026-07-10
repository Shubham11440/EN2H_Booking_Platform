import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [ServicesModule], // needed to inject ServicesService for serviceId validation
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
