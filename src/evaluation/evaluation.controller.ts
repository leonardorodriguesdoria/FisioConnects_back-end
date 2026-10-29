import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EvaluationResponseDto, EvaluationWithAuthorResponseDto } from './dto/evaluation-response.dto';
import { ErrorResponseDto, MessageResponseDto } from 'src/common/swagger/api-responses.dto';
import { ApiAuth, ApiPublicIdParam, ApiValidationError } from 'src/common/swagger/api-docs.decorators';


@ApiTags('Avaliações')
@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @ApiOperation({
    summary: 'Avalia um profissional',
    description: 'Somente usuários com perfil `PATIENT`. Cada paciente pode avaliar um mesmo profissional apenas uma vez (depois, use a rota de edição).',
  })
  @ApiAuth()
  @ApiPublicIdParam('publicId do profissional avaliado')
  @ApiCreatedResponse({ description: 'Avaliação registrada', type: EvaluationResponseDto })
  @ApiValidationError()
  @ApiForbiddenResponse({ description: 'Usuário autenticado não é paciente', type: ErrorResponseDto, example: { statusCode: 403, message: 'Apenas pacientes podem avaliar profissionais', error: 'Forbidden' } })
  @ApiNotFoundResponse({ description: 'Profissional não encontrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Profissional não encontrado', error: 'Not Found' } })
  @ApiConflictResponse({ description: 'O paciente já avaliou esse profissional', type: ErrorResponseDto, example: { statusCode: 409, message: 'Você já avaliou esse profissional', error: 'Conflict' } })
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

  // Permite ao front saber se o paciente logado já avaliou o profissional (para editar/excluir)
  @ApiOperation({
    summary: 'Retorna a avaliação do usuário autenticado para um profissional',
    description: 'Útil para o front decidir entre exibir "avaliar" ou "editar/excluir". Quando o usuário ainda não avaliou, a resposta é 200 com corpo vazio.',
  })
  @ApiAuth()
  @ApiPublicIdParam('publicId do profissional')
  @ApiOkResponse({ description: 'Avaliação do usuário ou corpo vazio se ainda não avaliou', type: EvaluationResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get('mine/:publicId')
  async getMyEvaluation(
    @Req() request,
    @Param('publicId') professionalPublicId: string
  ){
    const evaluation = await this.evaluationService.findPatientEvaluation(request.user.id, professionalPublicId);

    if(!evaluation){
      return null;
    }

    return{
      publicId: evaluation.publicId,
      rating: evaluation.rating,
      comment: evaluation.comment,
      createdAt: evaluation.createdAt
    }
  }

  @ApiOperation({ summary: 'Lista as avaliações de um profissional', description: 'Rota pública. Da mais recente para a mais antiga.' })
  @ApiPublicIdParam('publicId do profissional')
  @ApiOkResponse({ description: 'Avaliações recebidas pelo profissional', type: [EvaluationWithAuthorResponseDto] })
  @ApiNotFoundResponse({ description: 'Profissional não encontrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Profissional não encontrado', error: 'Not Found' } })
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

  @ApiOperation({ summary: 'Edita uma avaliação', description: 'Apenas o autor da avaliação pode editá-la. Envie somente os campos que deseja alterar.' })
  @ApiAuth()
  @ApiPublicIdParam('publicId da **avaliação**')
  @ApiOkResponse({ description: 'Avaliação atualizada', type: EvaluationResponseDto })
  @ApiValidationError()
  @ApiForbiddenResponse({ description: 'A avaliação pertence a outro usuário', type: ErrorResponseDto, example: { statusCode: 403, message: 'Você não tem permissão para alterar essa avaliação', error: 'Forbidden' } })
  @ApiNotFoundResponse({ description: 'Avaliação não encontrada', type: ErrorResponseDto, example: { statusCode: 404, message: 'Avaliação não encontrada', error: 'Not Found' } })
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

  @ApiOperation({ summary: 'Exclui uma avaliação', description: 'Apenas o autor da avaliação pode excluí-la.' })
  @ApiAuth()
  @ApiPublicIdParam('publicId da **avaliação**')
  @ApiOkResponse({ description: 'Avaliação excluída', type: MessageResponseDto, example: { message: 'Avaliação excluída com sucesso' } })
  @ApiForbiddenResponse({ description: 'A avaliação pertence a outro usuário', type: ErrorResponseDto, example: { statusCode: 403, message: 'Você não tem permissão para excluir essa avaliação', error: 'Forbidden' } })
  @ApiNotFoundResponse({ description: 'Avaliação não encontrada', type: ErrorResponseDto, example: { statusCode: 404, message: 'Avaliação não encontrada', error: 'Not Found' } })
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
