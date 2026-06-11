import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  getAll(@CurrentUser() user: { id: string }) {
    return this.favoritesService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.create(user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoritesService.remove(id);
  }
}
