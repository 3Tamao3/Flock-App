import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RoutesService } from './routes.service';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsNumber()
  distance!: number;

  @IsNumber()
  duration!: number;

  @IsNumber()
  originLat!: number;

  @IsNumber()
  originLng!: number;

  @IsNumber()
  destLat!: number;

  @IsNumber()
  destLng!: number;
}

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  create(@Body() dto: CreateRouteDto, @Req() req: any) {
    return this.routesService.saveRoute(
      req.user.id as string,
      dto.destination,
      dto.distance,
      dto.duration,
      dto.originLat,
      dto.originLng,
      dto.destLat,
      dto.destLng,
    );
  }

  @Get('history')
  getHistory(@Req() req: any) {
    return this.routesService.getHistory(req.user.id as string);
  }
}
