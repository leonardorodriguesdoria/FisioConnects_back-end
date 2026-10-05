import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/user/entities/user.entity';
import { Professional } from 'src/professional/entities/professional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User, Professional]), JwtModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService]
})
export class FavoritesModule {}
