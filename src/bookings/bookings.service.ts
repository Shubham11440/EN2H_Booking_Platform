import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingDto } from './dto/query-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
  ) {}

  async create(dto: CreateBookingDto) {
    // Throws 404 if the service does not exist or is inactive
    await this.servicesService.findOne(dto.serviceId);

    return this.prisma.booking.create({
      data: {
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        serviceId: dto.serviceId,
        bookingDate: dto.bookingDate,
        bookingTime: dto.bookingTime,
        notes: dto.notes,
      },
      select: bookingSelect,
    });
  }

  async findAll(query: QueryBookingDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              {
                customerName: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                customerEmail: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: bookingSelect,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      select: bookingSelect,
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    // findOne validates existence; business rules enforced in Phase 5
    await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
      select: bookingSelect,
    });
  }

  async cancel(id: string) {
    await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      select: bookingSelect,
    });
  }
}

// Shared select — includes nested service snapshot so callers
// get full booking context without a second request
const bookingSelect = {
  id: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  bookingDate: true,
  bookingTime: true,
  status: true,
  notes: true,
  service: {
    select: {
      id: true,
      title: true,
      duration: true,
      price: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;
