import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/hashPassword';
import { ICreateUser } from 'src/shared/interfaces/createUser.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private readonly _userRepository: Repository<User>
  ){}

  async createUser(body:ICreateUser): Promise<User>{
    try{
      const { name, email, phone, description, password, crefito, specialties } = body;
      
      const userAlreadyExists = await this._userRepository.findOne({where: {email: email}})

      //Verifica se existe algum usuário que já está usando o e-mail informado
      if(userAlreadyExists){
        throw new ConflictException("Já existe um usuário cadastrado com esse e-mail!!!")
      }

      const userWithCrefito = await this._userRepository.findOne({where: {crefito: crefito}})

      if(userWithCrefito){
        throw new ConflictException(
          'Já existe um usuário cadastrado com esse CREFITO',
        );
      }

      const hashedPassword = await hashPassword(password)

      const newUser = this._userRepository.create({
        name: name,
        email: email,
        phone: phone,
        description: description,
        password: hashedPassword,
        crefito: crefito,
        specialties: specialties
      })
      return await this._userRepository.save(newUser);
    }catch(error){
    if (error.code === '23505') {
      throw new ConflictException(
        'E-mail ou CREFITO já cadastrado',
      );
    }
      throw error;
    }
  }
}
