import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(chatId: string, senderId: string, content: string) {
    const message = await this.prisma.message.create({
      data: { chatId, senderId, content },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastMessage: content, updatedAt: new Date() },
    });

    return message;
  }

  async findAll(chatId: string) {
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, username: true } },
      },
    });
  }
}
