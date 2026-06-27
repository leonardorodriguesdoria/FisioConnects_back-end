import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { IFilter } from 'src/shared/interfaces/filterInterface/filter.interface';

@Injectable()
export class FilterService {
  constructor(@InjectRepository(User) private readonly _userRepository: Repository<User>){}


  async findAll(filters: IFilter){
    const {name, specialties, city} = filters;

    const query = this._userRepository
    .createQueryBuilder('user')
    .select([
    'user.id',
    'user.name',
    'user.email',
    'user.phone',
    'user.description',
    'user.crefito',
    'user.city',
    'user.profilePicture',
    'user.specialties'
    ]);

    if(name){
      query.andWhere('LOWER(user.name) LIKE LOWER(:name)', {
        name: `%${name}%`
      })
    }

    if(city?.trim()){
      query.andWhere('user.city ILIKE :city', {
        city: `%${city.trim()}%`
      })
    }

    if(specialties?.length){
      query.andWhere('user.specialties && :specialties', {
        specialties
      })
    }

    return query.getMany();
  }
  
}
