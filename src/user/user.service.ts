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

  async getAllUsers(): Promise<Partial<User>[]> {
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

    return professionals.map(professional => ({
        name: professional.user.name,
        description: professional.description,
        specialties: professional.specialties,
        city: professional.city,
        phone: professional.phone,
        profilePicture: professional.user.profilePicture
    }));
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

  async updateUser(id: number,body: IUpdateUserProfile){
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
      Object.assign(user, {
        name: body.name,
        email: body.email,
        profilePicture: body.profilePicture
      });

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
