import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UserInterceptor } from 'src/common/interceptors/interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateEvolutionDto } from './dto/create-evolution.dto';

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) {}

    @Post('register')
    async registerPatient(
        @Body() body: CreatePatientDto, 
        @Req() request) {
        await this.patientService.registerPatient(request.user.id,body);
        return { message: 'Paciente cadastrado com sucesso!' };
    }

    @UseInterceptors(UserInterceptor)
    @Get()
    async listAllPatients(
        @Req() request
    ){
        return this.patientService.getAllPatients(request.user.id);
    }

    @UseInterceptors(UserInterceptor)
    @Get(':publicId')
    async getOnePatient(
        @Req() request,
        @Param('publicId') publicId: string
    ){
        return this.patientService.getPatient(request.user.id, publicId);
    }

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

    @Delete(':publicId')
    async deletePatientProfile(
        @Req() request,
        @Param('publicId') publicId: string,
    ){
        await this.patientService.deletePatient(request.user.id, publicId);
        return {message: 'Perfil do paciente excluído com sucesso'}
    }

    /**ENDPOINTS DE EVOLUÇÃO DE QUADRO DO PACIENTES */

    @Post(':publicId/evolutions')
    async registerEvolution(
        @Req() request,
        @Param('publicId') publicId: string,
        @Body() body: CreateEvolutionDto
    ){
        await this.patientService.patientEvolution(request.user.id, publicId, body);
        return {message: 'Evolução registrada com sucesso'}
    }
}
