import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';

const mockService = { id: 'service-uuid', title: 'Haircut', duration: 30, price: '250.00', isActive: true };

const mockBooking = {
  id: 'booking-uuid',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: null,
  bookingDate: '2099-12-01',
  bookingTime: '10:00',
  status: BookingStatus.PENDING,
  notes: null,
  service: { id: mockService.id, title: mockService.title, duration: 30, price: '250.00' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: Record<string, any>;
  let servicesService: Record<string, any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: {
            booking: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ServicesService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockService),
          },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get(PrismaService);
    servicesService = module.get(ServicesService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      serviceId: 'service-uuid',
      bookingDate: '2099-12-01',
      bookingTime: '10:00',
    };

    it('throws BadRequestException for a past booking date', async () => {
      await expect(
        service.create({ ...dto, bookingDate: '2000-01-01' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when the service does not exist', async () => {
      servicesService.findOne.mockRejectedValue(new NotFoundException('Service not found'));

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when the slot is already taken', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('creates and returns a booking for valid input', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue(mockBooking);

      const result = await service.create(dto);

      expect(result.customerName).toBe('John Doe');
      expect(prisma.booking.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('throws NotFoundException when booking does not exist', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('returns the booking when it exists', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.findOne('booking-uuid');
      expect(result.id).toBe('booking-uuid');
    });
  });

  // ── updateStatus ──────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('throws BadRequestException when transitioning CANCELLED → COMPLETED', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        service.updateStatus('booking-uuid', { status: BookingStatus.COMPLETED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows valid status transitions (e.g. PENDING → CONFIRMED)', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue({ ...mockBooking, status: BookingStatus.CONFIRMED });

      const result = await service.updateStatus('booking-uuid', { status: BookingStatus.CONFIRMED });

      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('sets booking status to CANCELLED', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue({ ...mockBooking, status: BookingStatus.CANCELLED });

      const result = await service.cancel('booking-uuid');

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(prisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: BookingStatus.CANCELLED } }),
      );
    });
  });
});
