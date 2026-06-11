import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Get()
  getAll(@CurrentUser() user: { id: string }) {
    return this.chatsService.findAllForUser(user.id);
  }

  @Post('create-or-get')
  createOrGet(@CurrentUser() user: { id: string }, @Body('otherUserId') otherUserId: string) {
    return this.chatsService.createOrGet(user.id, otherUserId);
  }
}
