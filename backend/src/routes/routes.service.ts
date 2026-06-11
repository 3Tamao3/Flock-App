import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRouteDto) {
    return this.prisma.route.create({ data: { ...dto, userId } });
  }

  async findHistory(userId: string) {
    return this.prisma.route.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
