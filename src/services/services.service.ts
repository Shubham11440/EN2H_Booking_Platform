import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceDto, userId: string) {
    return this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        duration: dto.duration,
        price: dto.price,
        isActive: dto.isActive ?? true,
        createdBy: userId,
      },
      select: serviceSelect,
    });
  }

  async findAll(query: QueryServiceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' as const } }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: serviceSelect,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: serviceSelect,
    });

    if (!service || !service.isActive) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);

    return this.prisma.service.update({
      where: { id },
      data: dto,
      select: serviceSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

// Shared select shape — keeps response fields consistent across all operations
const serviceSelect = {
  id: true,
  title: true,
  description: true,
  duration: true,
  price: true,
  isActive: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} as const;
