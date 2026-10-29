import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfessionalPublicProfileDto } from './dto/professional-response.dto';
import { ErrorResponseDto, MessageResponseDto } from 'src/common/swagger/api-responses.dto';
import { ApiImageUpload, ApiInternalError, ApiPublicIdParam, ApiStrictThrottle, ApiValidationError } from 'src/common/swagger/api-docs.decorators';

@Controller('professional')
export class ProfessionalController {
  constructor(private readonly _professionalService: ProfessionalService){}

  @ApiTags('Cadastro')
  @ApiOperation({
    summary: 'Cadastra um profissional',
    description:
      'Cria uma conta com perfil `PROFESSIONAL` e o perfil profissional vinculado (com `publicId` próprio), ' +
      'e envia um código de verificação para o e-mail. A conta só é verificada no primeiro login com o campo `otp`.\n\n' +
      '**Especialidades em multipart:** envie um campo `specialties[]` para cada especialidade (ex.: `specialties[]=Ortopedia`).',
  })
  @ApiImageUpload(CreateProfessionalDto, 'CreateProfessionalWithImageDto', 'Foto de perfil opcional (JPEG, PNG ou WebP, até 5 MB)')
  @ApiCreatedResponse({
    description: 'Conta criada. A mensagem informa se o código de verificação foi enviado',
    type: MessageResponseDto,
    example: { message: 'Profissional cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail' },
  })
  @ApiValidationError()
  @ApiConflictResponse({
    description: 'E-mail ou telefone já cadastrado',
    type: ErrorResponseDto,
    example: { statusCode: 409, message: 'Esse número de telefone já se encontra cadastrado', error: 'Conflict' },
  })
  @ApiStrictThrottle()
  @ApiInternalError('Não foi possível enviar a imagem. Tente novamente mais tarde.')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
    async registerNewProfessional(
      @Body() createProfessionalDto: CreateProfessionalDto,
      @UploadedFile(
        new ParseFilePipe({
          fileIsRequired: false,
          validators: [
            new MaxFileSizeValidator({
              maxSize: 5 * 1024 * 1024
            }),
            new FileTypeValidator({
              fileType: /^image\/(jpeg|png|webp)$/,
            })
          ]
        })
      )
      image?: Express.Multer.File,
    ){
      const emailSent = await this._professionalService.createProfessional(createProfessionalDto, image);
      return{message: emailSent
        ? "Profissional cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"
        : "Profissional cadastrado com sucesso!.\n Não foi possível enviar o código de verificação agora. Use a opção de reenviar código ao fazer login"}
    }

  @ApiTags('Profissionais')
  @ApiOperation({ summary: 'Busca o perfil público de um profissional', description: 'Rota pública. Inclui a média e o total de avaliações.' })
  @ApiPublicIdParam('publicId do profissional')
  @ApiOkResponse({ description: 'Perfil do profissional', type: ProfessionalPublicProfileDto })
  @ApiNotFoundResponse({ description: 'Profissional não encontrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Profissional não encontrado', error: 'Not Found' } })
  @Get(':publicId')
    async getProfessional(@Param('publicId') publicId: string){
      return this._professionalService.getProfessionalByPublicId(publicId);
    }
}
