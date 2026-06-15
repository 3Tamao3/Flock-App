import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.findMe(req.user.id as string);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.id as string, dto);
  }

  @Get('search')
  search(@Query('username') username: string) {
    return this.usersService.search(username);
  }
}
