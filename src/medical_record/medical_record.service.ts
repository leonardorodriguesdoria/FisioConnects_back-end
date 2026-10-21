import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medicalRecord.entity';
import { IMedicalRecord } from 'src/shared/interfaces/medical_record_interface/medical_record.interface';
import { ClinicalPatient } from 'src/clinical_patients/entities/patient.entity';
import { nanoid } from 'nanoid';

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
      const patient = await this.findProfessionalPatient(userId, publicId);
      const newMedicalRecord = this._medicalRecordRepository.create({
        publicId: nanoid(),
        date: date,
        chiefComplaint: chiefComplain,
        diagnosis: diagnosis,
        treatmentPlan: treatmentPlan,
        observations: observations ?? '',
        patient: patient
      });
      return await this._medicalRecordRepository.save(newMedicalRecord);
  }

  async getAllMedicalRecords(userId: number){
      const medicalRecords = await this._medicalRecordRepository.find({
          where:{
            patient:{
                professional:{
                    user:{
                        id: userId
                    }
                }
            }
          },
          relations: {patient: true},
          order: {date: 'DESC', createdAt: 'DESC'}
      });
      return medicalRecords.map((record) => this.treatedMedicalRecord(record));
  }

  async getPatientMedicalRecords(userId: number, patientPublicId: string){
      const patient = await this.findProfessionalPatient(userId, patientPublicId);
      const medicalRecords = await this._medicalRecordRepository.find({
          where:{patient: {id: patient.id}},
          relations: {patient: true},
          order: {date: 'DESC', createdAt: 'DESC'}
      });
      return medicalRecords.map((record) => this.treatedMedicalRecord(record));
  }

  private async findProfessionalPatient(userId: number, publicId: string){
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
      return patient;
  }

  private treatedMedicalRecord(record: MedicalRecord){
      const {id, patient, ...rest} = record;
      return {
        ...rest,
        patient: {publicId: patient.publicId, name: patient.name}
      };
  }
}
