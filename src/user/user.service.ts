import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { IUpdateUserProfile } from 'src/shared/interfaces/user_interfaces/updateUser.interface';
import { Professional } from 'src/professional/entities/professional.entity';
import { UserTypes } from './types/UserTypes.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private readonly _userRepository: Repository<User>,

    @InjectRepository(Professional)
    private readonly _professionalRepository: Repository<Professional>,

  ){}
/*------------------------------------------------------------------------------------------- */
  /*FUNÇÕES DE CRUD DE PERFIL DO USUÁRIOS */

  async getAllUsers() {
    const professionals = await this._professionalRepository.find({
        relations: {
            user: true
        }
    });

    if (professionals.length === 0) {
        throw new NotFoundException(
            'Nenhum profissional encontrado em nossos registros'
        );
    }

    // Média e total de avaliações de cada profissional, calculados em uma única consulta
    const ratingStats: {id: number; average: string | null; total: string}[] = await this._professionalRepository
      .createQueryBuilder('professional')
      .leftJoin('professional.evaluations', 'evaluation')
      .select('professional.id', 'id')
      .addSelect('AVG(evaluation.rating)', 'average')
      .addSelect('COUNT(evaluation.id)', 'total')
      .groupBy('professional.id')
      .getRawMany();

    const ratingByProfessional = new Map(ratingStats.map(stat => [Number(stat.id), stat]));

    return professionals.map(professional => {
        const stats = ratingByProfessional.get(professional.id);

        return {
            publicId: professional.publicId,
            name: professional.user.name,
            description: professional.description,
            specialties: professional.specialties,
            city: professional.city,
            phone: professional.phone,
            profilePicture: professional.user.profilePicture,
            averageRating: stats?.average ? Math.round(Number(stats.average) * 10) / 10 : 0,
            totalEvaluations: stats ? Number(stats.total) : 0
        };
    });
  }

  async getOneUser(id: number){
    try{
      const user = await this._userRepository.findOne({where: {id: id}})
      if(!user){
        throw new NotFoundException("Usuário não encontrado")
      }
      return user;
    }catch(error){
      throw new InternalServerErrorException("Erro interno no sistema. Por favor, tente mais tarde")
    }
  }

  async updateUser(id: number,body: IUpdateUserProfile, uploadedImage?: {secureUrl: string; publicId: string}){
    try{
      const user = await this._userRepository.findOne({where: {id: id}})
      if(!user){
        throw new NotFoundException("Usuário não encontrado!!!!")
      }
      if(body.email && body.email !== user.email){
        const emailInUse = await this._userRepository.findOne({
          where: {email: body.email}
        });
        if(emailInUse){
          throw new ConflictException(
            "Este e-mail já está sendo usado por outro usuário"
          );
        }
      }
      if(body.name !== undefined){
        user.name = body.name
      }

      if(body.email !== undefined){
        user.email = body.email;
      }

      if(uploadedImage){
        user.profilePicture = uploadedImage.secureUrl;
        user.profilePicturePublicId = uploadedImage.publicId
      }

      const updatedUser = await this._userRepository.save(user);
      
      let updatedProfessional: Professional | null = null;

      if(user.role === UserTypes.PROFESSIONAL){
        const professional = await this._professionalRepository.findOne({where: {user: {id: user.id}}});

        if(!professional){
          throw new NotFoundException("Perfil profissional não encontrado")
        }

        Object.assign(professional, {
          phone: body.phone,
          description: body.description,
          specialties: body.specialties,
          city: body.city
        })

        updatedProfessional = await this._professionalRepository.save(professional)
      }

      return {user: updatedUser, professional: updatedProfessional};
    }catch(error){
      if(error instanceof NotFoundException || error instanceof ConflictException){
        throw error
      }
      throw new InternalServerErrorException("Erro interno no sistema. Por favor, tente mais tarde")
    }
  }

  async deleteUser(id: number){
    const user = await this._userRepository.findOne({where: {id: id}});
    if(!user){
      throw new NotFoundException("Algo deu errado no carregamento do perfil. Por favor, tente mais tarde")
    }
    await this._userRepository.delete(id)
    return true;
  }
}
