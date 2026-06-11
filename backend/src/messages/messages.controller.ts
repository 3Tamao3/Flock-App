import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('send')
  send(@CurrentUser() user: { id: string }, @Body() dto: SendMessageDto) {
    return this.messagesService.send(user.id, dto);
  }

  @Get(':chatId')
  getByChatId(@Param('chatId') chatId: string) {
    return this.messagesService.findByChatId(chatId);
  }
}
