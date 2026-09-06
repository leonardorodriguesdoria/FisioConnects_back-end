import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medicalRecord.entity';
import { IMedicalRecord } from 'src/shared/interfaces/medical_record_interface/medical_record.interface';
import { ClinicalPatient } from 'src/clinical_patients/entities/patient.entity';
import { Professional } from 'src/professional/entities/professional.entity';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly _medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(ClinicalPatient)
    private readonly _patientRepository: Repository<ClinicalPatient>,
  ){}

  async createMedicalRecord(userId: number, body: IMedicalRecord, publicId: string){
      const {date, chiefComplain, diagnosis, treatmentPlan, observations} = body;
      const patient = await this._patientRepository.findOne({
          where:{
            publicId,
            professional:{
                user:{
                    id: userId
                }
            }
          }
      });
      if(!patient){
        throw new NotFoundException("Paciente não encontrado ou não pertence ao profissional autenticado.")
      }
      const newMedicalRecord = this._medicalRecordRepository.create({
        date: date,
        chiefComplaint: chiefComplain,
        diagnosis: diagnosis,
        treatmentPlan: treatmentPlan,
        observations: observations,
        patient: patient 
      });
      return await this._medicalRecordRepository.save(newMedicalRecord);
  }
}
