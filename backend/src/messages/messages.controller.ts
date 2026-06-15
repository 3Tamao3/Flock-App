import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  send(@Body() body: { chatId: string; content: string }, @Req() req: any) {
    return this.messagesService.send(body.chatId, req.user.id as string, body.content);
  }

  @Get(':chatId')
  findAll(@Param('chatId') chatId: string) {
    return this.messagesService.findAll(chatId);
  }
}
