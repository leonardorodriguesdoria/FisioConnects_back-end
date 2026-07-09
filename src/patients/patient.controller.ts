import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UserInterceptor } from 'src/common/interceptors/interceptor';

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
