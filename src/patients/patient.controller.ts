import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UserInterceptor } from 'src/common/interceptors/interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePatientDto } from './dto/update-patient.dto';

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) {}

    @Post('register/:id')
    async registerPatient(@Body() body: CreatePatientDto, @Param('id', ParseIntPipe) id: number) {
        await this.patientService.registerPatient(id,body);
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
    @Get(':patientId')
    async getOnePatient(
        @Req() requision,
        @Param('patientId', ParseIntPipe) patientId: number
    ){
        return this.patientService.getPatient(requision.user.id, patientId);
    }

    @Patch('update/:patientId')
    @UseInterceptors(FileInterceptor('image'))
    async updatePatientProfile(
        @Req() request,
        @Param('patientId', ParseIntPipe) patientId: number,
        @Body() body: UpdatePatientDto,
        @UploadedFile() image: Express.Multer.File
    ){
        if(image){
            body.picture = image.path
        }
        const updatePatientProfile = await this.patientService.updatePatient(request.user.id, patientId, body);
        return {
            message: 'Perfil do paciente atualizado com sucesso',
        };
    }

    @Delete(':patientId')
    async deletePatientProfile(
        @Req() request,
        @Param('patientId', ParseIntPipe) patientId: number,
    ){
        await this.patientService.deletePatient(request.user.id, patientId);
        return {message: 'Perfil do paciente excluído com sucesso'}
    }

    @Post('medical-records/:id')
    async registerMedicalRecord(
        @Param('id', ParseIntPipe) patientId: number,
        @Body() body: CreateMedicalRecordDto
    ) {
        await this.patientService.registerMedicalRecord(patientId, body);
        return {
            message: 'Prontuário registrado com sucesso!'
        };
    }
}
