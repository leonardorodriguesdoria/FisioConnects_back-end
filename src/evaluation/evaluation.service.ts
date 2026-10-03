import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { Repository } from 'typeorm';
import { IEvaluation } from 'src/shared/interfaces/evaluation_interface/evaluation.interface';
import { Professional } from 'src/professional/entities/professional.entity';
import { User } from 'src/user/entities/user.entity';
import { UserTypes } from 'src/user/types/UserTypes.enum';
import { nanoid } from 'nanoid';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly _evaluationRepository: Repository<Evaluation>,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Professional)
    private readonly _professionalRepository: Repository<Professional>,
  ){}

  async createEvaluation(userId: number, professionalPublicId: string, body: IEvaluation){
    const {rating, comment} = body;

    const patient = await this._userRepository.findOne({where: {id: userId}});

    if(!patient){
      throw new NotFoundException("Houve um problema ao carregar seu perfil");
    }

    if(patient.role !== UserTypes.PATIENT){
      throw new ForbiddenException("Apenas pacientes podem avaliar profissionais");
    }

    const professional = await this._professionalRepository.findOne({where: {publicId: professionalPublicId}});

    if(!professional){
      throw new NotFoundException("Profissional não encontrado");
    }

    const evaluationAlreadyExists = await this._evaluationRepository.findOne({
      where: {
        patient: {
          id: patient.id
        },
        professional: {
          id: professional.id
        }
      }
    });

    if(evaluationAlreadyExists){
      throw new ConflictException("Você já avaliou esse profissional");
    }

    const newEvaluation = this._evaluationRepository.create({
      publicId: nanoid(),
      rating: rating,
      comment: comment,
      patient: patient,
      professional: professional
    });

    return await this._evaluationRepository.save(newEvaluation);
  }


  async listAllEvaluations(professionalPublicId: string) {
    const professional = await this._professionalRepository.findOne({
      where: {
        publicId: professionalPublicId,
      },
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    return this._evaluationRepository.find({
      where: {
        professional: {
          id: professional.id,
        },
      },
      relations: {
        patient: true,
      },
      select: {
        publicId: true,
        rating: true,
        comment: true,
        createdAt: true,
        patient: {
          name: true,
          profilePicture: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateEvaluation(userId: number, evaluationPublicId: string, body: Partial<IEvaluation>) {
    const { rating, comment } = body;

    const evaluation = await this._evaluationRepository.findOne({
      where: {
        publicId: evaluationPublicId,
      },
      relations: {
        patient: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (evaluation.patient.id !== userId) {
      throw new ForbiddenException('Você não tem permissão para alterar essa avaliação');
    }

    if (rating !== undefined) {
      evaluation.rating = rating;
    }

    if (comment !== undefined) {
      evaluation.comment = comment;
    }

    return await this._evaluationRepository.save(evaluation);
  }
}
