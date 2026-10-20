import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { IFilter } from 'src/shared/interfaces/filterInterface/filter.interface';
import { Professional } from 'src/professional/entities/professional.entity';


const ACCENTED = 'áàâãäéèêëíìîïóòôõöúùûüçñ';
const PLAIN = 'aaaaaeeeeiiiiooooouuuucn';


function normalizeColumn(column: string): string {
  return `translate(lower(${column}), '${ACCENTED}', '${PLAIN}')`;
}

function normalizeTerm(term: string): string {
  return term.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}


function likePattern(term: string): string {
  return `%${normalizeTerm(term).replace(/[\\%_]/g, '\\$&')}%`;
}

const NAME = normalizeColumn('account.name');
const CITY = normalizeColumn('professional.city');
const SPECIALTIES = normalizeColumn(`array_to_string(professional.specialties, ' ')`);

@Injectable()
export class FilterService {
  constructor(
    @InjectRepository(Professional)
    private readonly _professionalRepository: Repository<Professional>
  ){}


  async findAll(filters: IFilter){
    const {search, name, specialties, city} = filters;

    const query = this._professionalRepository
    .createQueryBuilder('professional')
    .innerJoinAndSelect('professional.user', 'account')
    .orderBy('account.name', 'ASC');


    const words = normalizeTerm(search ?? '').split(/\s+/).filter(Boolean);
    words.forEach((word, index) => {
      const param = `search${index}`;
      query.andWhere(new Brackets(where => {
        where
        .where(`${NAME} LIKE :${param}`)
        .orWhere(`${CITY} LIKE :${param}`)
        .orWhere(`${SPECIALTIES} LIKE :${param}`);
      }), {[param]: likePattern(word)});
    });

    if (name?.trim()) {
      query.andWhere(`${NAME} LIKE :name`, {name: likePattern(name)});
    }

    if (city?.trim()) {
      query.andWhere(`${CITY} LIKE :city`, {city: likePattern(city)});
    }

    
    const specialtyTerms = (specialties ?? []).filter(specialty => specialty?.trim());
    if (specialtyTerms.length) {
      query.andWhere(new Brackets(where => {
        specialtyTerms.forEach((specialty, index) => {
          where.orWhere(`${SPECIALTIES} LIKE :specialty${index}`, {[`specialty${index}`]: likePattern(specialty)});
        });
      }));
    }

    const professionals = await query.getMany();
    if (professionals.length === 0) {
      return [];
    }

    
    const ratingStats: {id: number; average: string | null; total: string}[] = await this._professionalRepository
      .createQueryBuilder('professional')
      .leftJoin('professional.evaluations', 'evaluation')
      .select('professional.id', 'id')
      .addSelect('AVG(evaluation.rating)', 'average')
      .addSelect('COUNT(evaluation.id)', 'total')
      .where('professional.id IN (:...ids)', {ids: professionals.map(professional => professional.id)})
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

}
