import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
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
}
