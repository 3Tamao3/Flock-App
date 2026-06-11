import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateRouteDto) {
    return this.routesService.create(user.id, dto);
  }

  @Get('history')
  getHistory(@CurrentUser() user: { id: string }) {
    return this.routesService.findHistory(user.id);
  }
}
