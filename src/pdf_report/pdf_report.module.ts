import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PdfReportService } from './pdf_report.service';
import { PdfReportController } from './pdf_report.controller';
import { Professional } from 'src/professional/entities/professional.entity';
import { ClinicalPatient } from 'src/clinical_patients/entities/patient.entity';
import { MedicalRecord } from 'src/medical_record/entities/medicalRecord.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Professional, ClinicalPatient, MedicalRecord]), JwtModule],
  controllers: [PdfReportController],
  providers: [PdfReportService],
})
export class PdfReportModule {}
