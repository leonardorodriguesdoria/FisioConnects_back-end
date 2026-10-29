import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Favorite } from './entities/favorite.entity';
import { ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { ErrorResponseDto, MessageResponseDto } from 'src/common/swagger/api-responses.dto';
import { ApiAuth, ApiPublicIdParam, ApiValidationError } from 'src/common/swagger/api-docs.decorators';

@ApiTags('Favoritos')
@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @ApiOperation({ summary: 'Adiciona um profissional aos favoritos', description: 'Somente usuários com perfil `PATIENT`.' })
  @ApiCreatedResponse({ description: 'Profissional favoritado', type: FavoriteResponseDto })
  @ApiValidationError()
  @ApiForbiddenResponse({ description: 'Usuário autenticado não é paciente', type: ErrorResponseDto, example: { statusCode: 403, message: 'Apenas pacientes podem favoritar profissionais', error: 'Forbidden' } })
  @ApiNotFoundResponse({ description: 'Profissional não encontrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Profissional não encontrado', error: 'Not Found' } })
  @ApiConflictResponse({ description: 'Profissional já está nos favoritos', type: ErrorResponseDto, example: { statusCode: 409, message: 'Esse profissional já está nos seus favoritos', error: 'Conflict' } })
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

  @ApiOperation({ summary: 'Lista os profissionais favoritos do usuário autenticado', description: 'Do favoritado mais recentemente para o mais antigo.' })
  @ApiOkResponse({ description: 'Favoritos do usuário', type: [FavoriteResponseDto] })
  @Get()
  async listFavorites(@Req() request){
    const favorites = await this.favoritesService.listFavorites(request.user.id);

    return favorites.map(favorite => this.toResponse(favorite));
  }

  @ApiOperation({ summary: 'Remove um profissional dos favoritos' })
  @ApiPublicIdParam('publicId do **profissional**')
  @ApiOkResponse({ description: 'Profissional removido dos favoritos', type: MessageResponseDto, example: { message: 'Profissional removido dos favoritos com sucesso' } })
  @ApiNotFoundResponse({ description: 'O profissional não está nos favoritos', type: ErrorResponseDto, example: { statusCode: 404, message: 'Esse profissional não está nos seus favoritos', error: 'Not Found' } })
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
