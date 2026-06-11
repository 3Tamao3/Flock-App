import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(senderId: string, dto: SendMessageDto) {
    const message = await this.prisma.message.create({
      data: { content: dto.content, chatId: dto.chatId, senderId },
      include: { sender: { select: { id: true, username: true } } },
    });

    await this.prisma.chat.update({
      where: { id: dto.chatId },
      data: { lastMessage: dto.content },
    });

    return message;
  }

  async findByChatId(chatId: string) {
    return this.prisma.message.findMany({
      where: { chatId },
      include: { sender: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
