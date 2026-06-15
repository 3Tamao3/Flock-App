import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FavoritesService } from './favorites.service';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  destination!: string;
}

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.favoritesService.findAll(req.user.id as string);
  }

  @Post()
  create(@Body() dto: CreateFavoriteDto, @Req() req: any) {
    return this.favoritesService.create(req.user.id as string, dto.destination);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.favoritesService.remove(id, req.user.id as string);
  }
}
