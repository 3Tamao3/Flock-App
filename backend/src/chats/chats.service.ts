import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async createOrGet(userId: string, otherUserId: string) {
    const [a, b] = [userId, otherUserId].sort();
    const existing = await this.prisma.chat.findUnique({
      where: { user1Id_user2Id: { user1Id: a, user2Id: b } },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
      },
    });
    if (existing) return existing;

    return this.prisma.chat.create({
      data: { user1Id: a, user2Id: b },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.chat.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
