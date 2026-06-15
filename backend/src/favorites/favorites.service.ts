import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, destination: string) {
    return this.prisma.favorite.create({ data: { userId, destination } });
  }

  async remove(id: string, userId: string) {
    return this.prisma.favorite.deleteMany({ where: { id, userId } });
  }
}
