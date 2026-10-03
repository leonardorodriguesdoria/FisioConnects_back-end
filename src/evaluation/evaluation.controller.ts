import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';


@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':publicId')
  async registerEvaluation(
    @Req() request,
    @Param('publicId') professionalPublicId: string,
    @Body() body: CreateEvaluationDto
  ){
    const evaluation = await this.evaluationService.createEvaluation(
      request.user.id,
      professionalPublicId,
      body
    );

    return{
      publicId:evaluation.publicId,
      rating: evaluation.rating,
      comment: evaluation.comment,
      createdAt: evaluation.createdAt
    }
  }

  @Get(':publicId')
  async listEvaluations(
    @Param('publicId') professionalPublicId: string
  ){
    const evaluations = await this.evaluationService.listAllEvaluations(professionalPublicId);

    return evaluations.map(evaluation => ({
      publicId: evaluation.publicId,
      rating: evaluation.rating,
      comment: evaluation.comment,
      createdAt: evaluation.createdAt,
      patient: {
        name: evaluation.patient.name,
        profilePicture: evaluation.patient.profilePicture
      }
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:publicId')
  async updateEvaluation(
    @Req() request,
    @Param('publicId') evaluationPublicId: string,
    @Body() body: UpdateEvaluationDto
  ){
    const evaluation = await this.evaluationService.updateEvaluation(
      request.user.id,
      evaluationPublicId,
      body
    );

    return{
      publicId: evaluation.publicId,
      rating: evaluation.rating,
      comment: evaluation.comment,
      createdAt: evaluation.createdAt
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':publicId')
  async deleteEvaluation(
    @Req() request,
    @Param('publicId') evaluationPublicId: string
  ){
    await this.evaluationService.deleteEvaluation(request.user.id, evaluationPublicId);

    return{message: 'Avaliação excluída com sucesso'}
  }
}
