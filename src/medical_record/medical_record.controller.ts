import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from './medical_record.service';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post('register/:publicId')
  async registerMedicalRecord(
    @Body() 
    createMedicalRecordDto: CreateMedicalRecordDto,
    @Req()
    request,
    @Param(':publicId') 
    publicId: string
  ){
    await this.medicalRecordService.createMedicalRecord(request.user.id, createMedicalRecordDto, publicId);
    return {message: "Prontuário cadastrado com sucesso!!!"}
  }
}
