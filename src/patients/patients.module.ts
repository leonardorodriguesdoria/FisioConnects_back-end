import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from '../user/entities/medicalRecord.entity';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([Patient, MedicalRecord, User]), JwtModule],
    controllers: [PatientController],
    providers: [PatientService],
    exports: [PatientService]
})
export class PatientsModule {}
