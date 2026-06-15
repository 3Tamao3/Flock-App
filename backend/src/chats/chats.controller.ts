import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ChatsService } from './chats.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('create-or-get')
  createOrGet(@Body() body: { userId: string }, @Req() req: any) {
    return this.chatsService.createOrGet(req.user.id as string, body.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.chatsService.findAllForUser(req.user.id as string);
  }
}
