import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from '../user/entities/medicalRecord.entity';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
    imports: [
        MulterModule.register({
        storage: diskStorage({
        destination: './patientPictureUpload',
        filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
                const ext = extname(file.originalname);
                const filename = `${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        }),
    }),TypeOrmModule.forFeature([Patient, MedicalRecord, User]),JwtModule],
    controllers: [PatientController],
    providers: [PatientService],
    exports: [PatientService]
})
export class PatientsModule {}
