import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UserInterceptor } from 'src/common/interceptors/interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateEvolutionDto } from './dto/create-evolution.dto';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClinicalPatientResponseDto, EvolutionResponseDto } from './dto/clinical-patient-response.dto';
import { ErrorResponseDto, MessageResponseDto } from 'src/common/swagger/api-responses.dto';
import { ApiAuth, ApiImageUpload, ApiInternalError, ApiPublicIdParam, ApiValidationError } from 'src/common/swagger/api-docs.decorators';

@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) {}

    @ApiTags('Pacientes clínicos')
    @ApiOperation({
        summary: 'Cadastra um paciente clínico',
        description:
            'Cadastra um paciente na carteira do profissional autenticado. O e-mail deve ser único entre os pacientes do mesmo profissional. ' +
            'Usuários que não são profissionais recebem 404.',
    })
    @ApiCreatedResponse({ description: 'Paciente cadastrado', type: MessageResponseDto, example: { message: 'Paciente cadastrado com sucesso!' } })
    @ApiValidationError()
    @ApiNotFoundResponse({ description: 'Perfil profissional do usuário autenticado não encontrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Houve um problema ao carregar seu perfil', error: 'Not Found' } })
    @ApiConflictResponse({
        description: 'O profissional já cadastrou um paciente com esse e-mail',
        type: ErrorResponseDto,
        example: { statusCode: 409, message: 'Você já cadastrou um paciente com esse e-mail', error: 'Conflict' },
    })
    @Post('register')
    async registerPatient(
        @Body() body: CreatePatientDto, 
        @Req() request) {
        await this.patientService.registerPatient(request.user.id,body);
        return { message: 'Paciente cadastrado com sucesso!' };
    }

    @ApiTags('Pacientes clínicos')
    @ApiOperation({ summary: 'Lista os pacientes do profissional autenticado', description: 'Ordenados por nome.' })
    @ApiOkResponse({ description: 'Pacientes do profissional', type: [ClinicalPatientResponseDto] })
    @ApiNotFoundResponse({ description: 'Perfil profissional do usuário autenticado não encontrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Profissional não encontrado', error: 'Not Found' } })
    @UseInterceptors(UserInterceptor)
    @Get()
    async listAllPatients(
        @Req() request
    ){
        return this.patientService.getAllPatients(request.user.id);
    }

    @ApiTags('Pacientes clínicos')
    @ApiOperation({ summary: 'Busca um paciente do profissional autenticado' })
    @ApiPublicIdParam('publicId do paciente clínico')
    @ApiOkResponse({ description: 'Dados do paciente', type: ClinicalPatientResponseDto })
    @ApiNotFoundResponse({ description: 'Paciente não existe ou pertence a outro profissional', type: ErrorResponseDto, example: { statusCode: 404, message: 'Paciente não encontrado', error: 'Not Found' } })
    @ApiInternalError('Erro Interno do sistema.Por favor, tente mais tarde')
    @UseInterceptors(UserInterceptor)
    @Get(':publicId')
    async getOnePatient(
        @Req() request,
        @Param('publicId') publicId: string
    ){
        return this.patientService.getPatient(request.user.id, publicId);
    }

    @ApiTags('Pacientes clínicos')
    @ApiOperation({
        summary: 'Atualiza os dados de um paciente',
        description: 'Envie apenas os campos que deseja alterar. Uma nova foto pode ser enviada no campo `image`.',
    })
    @ApiPublicIdParam('publicId do paciente clínico')
    @ApiImageUpload(UpdatePatientDto, 'UpdatePatientWithImageDto', 'Nova foto do paciente (opcional)')
    @ApiOkResponse({ description: 'Paciente atualizado', type: MessageResponseDto, example: { message: 'Perfil do paciente atualizado com sucesso' } })
    @ApiValidationError()
    @ApiNotFoundResponse({ description: 'Paciente não existe ou pertence a outro profissional', type: ErrorResponseDto, example: { statusCode: 404, message: 'Paciente não encontrado', error: 'Not Found' } })
    @ApiConflictResponse({
        description: 'O profissional já possui outro paciente com esse e-mail',
        type: ErrorResponseDto,
        example: { statusCode: 409, message: 'Você já cadastrou um paciente com esse e-mail', error: 'Conflict' },
    })
    @ApiInternalError('Erro no sistema. Por favor tente novamente mais tarde')
    @Patch('update/:publicId')
    @UseInterceptors(FileInterceptor('image'))
    async updatePatientProfile(
        @Req() request,
        @Param('publicId') publicId: string,
        @Body() body: UpdatePatientDto,
        @UploadedFile() image: Express.Multer.File
    ){
        if(image){
            body.picture = image.path
        }
        await this.patientService.updatePatient(request.user.id, publicId, body);
        return {
            message: 'Perfil do paciente atualizado com sucesso',
        };
    }

    @ApiTags('Pacientes clínicos')
    @ApiOperation({
        summary: 'Exclui um paciente',
        description: 'Remove o paciente e, em cascata, todos os seus prontuários e evoluções.',
    })
    @ApiPublicIdParam('publicId do paciente clínico')
    @ApiOkResponse({ description: 'Paciente excluído', type: MessageResponseDto, example: { message: 'Perfil do paciente excluído com sucesso' } })
    @ApiNotFoundResponse({ description: 'Paciente não existe ou pertence a outro profissional', type: ErrorResponseDto, example: { statusCode: 404, message: 'Ocorreu um erro inesperado. Perfil do paciente não foi encontrado!!!', error: 'Not Found' } })
    @Delete(':publicId')
    async deletePatientProfile(
        @Req() request,
        @Param('publicId') publicId: string,
    ){
        await this.patientService.deletePatient(request.user.id, publicId);
        return {message: 'Perfil do paciente excluído com sucesso'}
    }

    /**ENDPOINTS DE EVOLUÇÃO DE QUADRO DO PACIENTES */

    @ApiTags('Evoluções')
    @ApiOperation({
        summary: 'Registra uma evolução do quadro em um prontuário',
        description: '**Atenção:** apesar da rota ficar em `/patients`, o `publicId` informado é o do **prontuário**, não o do paciente.',
    })
    @ApiPublicIdParam('publicId do **prontuário** (não do paciente)')
    @ApiCreatedResponse({ description: 'Evolução registrada', type: MessageResponseDto, example: { message: 'Evolução registrada com sucesso' } })
    @ApiValidationError()
    @ApiNotFoundResponse({ description: 'Prontuário não existe ou pertence a outro profissional', type: ErrorResponseDto, example: { statusCode: 404, message: 'Prontuário não encontrado ou não pertence ao profissional', error: 'Not Found' } })
    @Post(':publicId/evolutions')
    async registerEvolution(
        @Req() request,
        @Param('publicId') publicId: string,
        @Body() body: CreateEvolutionDto
    ){
        await this.patientService.patientEvolution(request.user.id, publicId, body);
        return {message: 'Evolução registrada com sucesso'}
    }

    @ApiTags('Evoluções')
    @ApiOperation({
        summary: 'Lista as evoluções de um prontuário',
        description: 'Ordenadas da mais antiga para a mais recente. O `publicId` informado é o do **prontuário**.',
    })
    @ApiPublicIdParam('publicId do **prontuário** (não do paciente)')
    @ApiOkResponse({ description: 'Evoluções do prontuário', type: [EvolutionResponseDto] })
    @ApiNotFoundResponse({ description: 'Prontuário não existe ou pertence a outro profissional', type: ErrorResponseDto, example: { statusCode: 404, message: 'Prontuário não encontrado', error: 'Not Found' } })
    @Get(':publicId/evolutions')
    async getEvolutions(
        @Req() request,
        @Param('publicId') publicId: string
    ){
        return this.patientService.listEvolutions(request.user.id, publicId);
    } 
}
