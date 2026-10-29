import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from "@nestjs/platform-express";
import { PatientService } from "./patient.service";
import { CreatePatientDto } from "src/patient/dto/create-patient.dto";
import { ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MessageResponseDto, ErrorResponseDto } from "src/common/swagger/api-responses.dto";
import { ApiImageUpload, ApiInternalError, ApiStrictThrottle, ApiValidationError } from "src/common/swagger/api-docs.decorators";

@ApiTags('Cadastro')
@Controller('patient')
export class PatintController {
    constructor(private readonly _patientService: PatientService){}

    @ApiOperation({
      summary: 'Cadastra um paciente (usuário da plataforma)',
      description:
        'Cria uma conta com perfil `PATIENT` e envia um código de verificação para o e-mail informado. ' +
        'A conta só é verificada no primeiro login com o campo `otp` (veja `POST /auth/login`).',
    })
    @ApiImageUpload(CreatePatientDto, 'CreatePatientWithImageDto', 'Foto de perfil opcional (JPEG, PNG ou WebP, até 5 MB)')
    @ApiCreatedResponse({
      description: 'Conta criada. A mensagem informa se o código de verificação foi enviado',
      type: MessageResponseDto,
      example: { message: 'Paciente cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail' },
    })
    @ApiValidationError()
    @ApiConflictResponse({ description: 'E-mail já cadastrado', type: ErrorResponseDto, example: { statusCode: 409, message: 'Já existe um usuário cadastrado com esse e-mail!!!', error: 'Conflict' } })
    @ApiStrictThrottle()
    @ApiInternalError('Não foi possível enviar a imagem. Tente novamente mais tarde.')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('register')
    @UseInterceptors(FileInterceptor('image'))
    async registerNewPatient(
      @Body() userDto: CreatePatientDto,
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
    const emailSent = await this._patientService.createPatient(userDto, image);
    return{message: emailSent
      ? "Paciente cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"
      : "Paciente cadastrado com sucesso!.\n Não foi possível enviar o código de verificação agora. Use a opção de reenviar código ao fazer login"}
  }
}