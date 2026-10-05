import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Favorite } from './entities/favorite.entity';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async addFavorite(
    @Req() request,
    @Body() body: CreateFavoriteDto
  ){
    const favorite = await this.favoritesService.addFavorite(
      request.user.id,
      body.professionalPublicId
    );

    return this.toResponse(favorite);
  }

  @Get()
  async listFavorites(@Req() request){
    const favorites = await this.favoritesService.listFavorites(request.user.id);

    return favorites.map(favorite => this.toResponse(favorite));
  }

  @Delete(':publicId')
  async removeFavorite(
    @Req() request,
    @Param('publicId') professionalPublicId: string
  ){
    await this.favoritesService.removeFavorite(request.user.id, professionalPublicId);

    return{message: 'Profissional removido dos favoritos com sucesso'}
  }

  private toResponse(favorite: Favorite){
    return{
      favoritedAt: favorite.createdAt,
      professional: {
        publicId: favorite.professional.publicId,
        name: favorite.professional.user.name,
        profilePicture: favorite.professional.user.profilePicture,
        description: favorite.professional.description,
        specialties: favorite.professional.specialties,
        city: favorite.professional.city
      }
    }
  }
}
