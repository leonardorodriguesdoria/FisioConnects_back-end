import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/user/entities/user.entity';
import { Professional } from 'src/professional/entities/professional.entity';
import { UserTypes } from 'src/user/types/UserTypes.enum';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly _favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Professional)
    private readonly _professionalRepository: Repository<Professional>,
  ){}

  async addFavorite(userId: number, professionalPublicId: string){
    const patient = await this._userRepository.findOne({where: {id: userId}});

    if(!patient){
      throw new NotFoundException("Houve um problema ao carregar seu perfil");
    }

    if(patient.role !== UserTypes.PATIENT){
      throw new ForbiddenException("Apenas pacientes podem favoritar profissionais");
    }

    const professional = await this._professionalRepository.findOne({
      where: {publicId: professionalPublicId},
      relations: {user: true}
    });

    if(!professional){
      throw new NotFoundException("Profissional não encontrado");
    }

    const favoriteAlreadyExists = await this._favoriteRepository.findOne({
      where: {
        patient: {
          id: patient.id
        },
        professional: {
          id: professional.id
        }
      }
    });

    if(favoriteAlreadyExists){
      throw new ConflictException("Esse profissional já está nos seus favoritos");
    }

    const newFavorite = this._favoriteRepository.create({
      patient: patient,
      professional: professional
    });

    return await this._favoriteRepository.save(newFavorite);
  }

  async listFavorites(userId: number){
    return this._favoriteRepository.find({
      where: {
        patient: {
          id: userId,
        },
      },
      relations: {
        professional: {
          user: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async removeFavorite(userId: number, professionalPublicId: string){
    const favorite = await this._favoriteRepository.findOne({
      where: {
        patient: {
          id: userId,
        },
        professional: {
          publicId: professionalPublicId,
        },
      },
    });

    if(!favorite){
      throw new NotFoundException('Esse profissional não está nos seus favoritos');
    }

    await this._favoriteRepository.remove(favorite);
  }
}
