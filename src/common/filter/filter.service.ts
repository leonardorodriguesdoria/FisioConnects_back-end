import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFilter } from 'src/shared/interfaces/filterInterface/filter.interface';
import { Professional } from 'src/professional/entities/professional.entity';

@Injectable()
export class FilterService {
  constructor(
    @InjectRepository(Professional) 
    private readonly _professionalRepository: Repository<Professional>
  ){}


  async findAll(filters: IFilter){
    const {name, specialties, city} = filters;

    const query = this._professionalRepository
    .createQueryBuilder('professional')
    .leftJoinAndSelect('professional.user', 'user')
    .select([
      'professional.id',
      'professional.phone',
      'professional.description',
      'professional.city',
      'professional.specialties',

      'user.name',
      'user.profilePicture',
    ]);

    if (name?.trim()) {
      query.andWhere('user.name ILIKE :name', {
          name: `%${name.trim()}%`
      });
    }

    if (city?.trim()) {
      query.andWhere('professional.city ILIKE :city', {
          city: `%${city.trim()}%`
      });
    }

    if(specialties?.length){
      query.andWhere('professional.specialties && ARRAY[:...specialties]',{specialties})
    }

    return query.getMany();
  }
  
}
