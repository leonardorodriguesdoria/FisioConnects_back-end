import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from './medical_record.service';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MedicalRecordResponseDto } from './dto/medical-record-response.dto';
import { ErrorResponseDto, MessageResponseDto } from 'src/common/swagger/api-responses.dto';
import { ApiAuth, ApiPublicIdParam, ApiValidationError } from 'src/common/swagger/api-docs.decorators';

const PATIENT_NOT_FOUND = 'Paciente não encontrado ou não pertence ao profissional autenticado.';

@ApiTags('Prontuários')
@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @ApiOperation({
    summary: 'Cadastra um prontuário para um paciente',
    description: 'O prontuário recebe um `publicId` próprio, usado depois para registrar e listar as evoluções do quadro.',
  })
  @ApiPublicIdParam('publicId do paciente clínico')
  @ApiCreatedResponse({ description: 'Prontuário cadastrado', type: MessageResponseDto, example: { message: 'Prontuário cadastrado com sucesso!!!' } })
  @ApiValidationError()
  @ApiNotFoundResponse({ description: 'Paciente não existe ou pertence a outro profissional', type: ErrorResponseDto, example: { statusCode: 404, message: PATIENT_NOT_FOUND, error: 'Not Found' } })
  @Post('register/:publicId')
  async registerMedicalRecord(
    @Body()
    createMedicalRecordDto: CreateMedicalRecordDto,
    @Req()
    request,
    @Param('publicId')
    publicId: string
  ){
    await this.medicalRecordService.createMedicalRecord(request.user.id, createMedicalRecordDto, publicId);
    return {message: "Prontuário cadastrado com sucesso!!!"}
  }

  @ApiOperation({
    summary: 'Lista todos os prontuários do profissional autenticado',
    description: 'Inclui prontuários de todos os pacientes, do mais recente para o mais antigo (por `date` e depois `createdAt`).',
  })
  @ApiOkResponse({ description: 'Prontuários do profissional', type: [MedicalRecordResponseDto] })
  @Get()
  async listMedicalRecords(@Req() request){
    return this.medicalRecordService.getAllMedicalRecords(request.user.id);
  }

  @ApiOperation({ summary: 'Lista os prontuários de um paciente', description: 'Do mais recente para o mais antigo.' })
  @ApiPublicIdParam('publicId do paciente clínico')
  @ApiOkResponse({ description: 'Prontuários do paciente', type: [MedicalRecordResponseDto] })
  @ApiNotFoundResponse({ description: 'Paciente não existe ou pertence a outro profissional', type: ErrorResponseDto, example: { statusCode: 404, message: PATIENT_NOT_FOUND, error: 'Not Found' } })
  @Get('patient/:publicId')
  async listPatientMedicalRecords(
    @Req() request,
    @Param('publicId') publicId: string
  ){
    return this.medicalRecordService.getPatientMedicalRecords(request.user.id, publicId);
  }
}
