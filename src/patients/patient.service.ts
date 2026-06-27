import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Patient } from "./entities/patient.entity";
import { Repository } from "typeorm";
import { IPatient } from "src/shared/interfaces/patient_interface/patient_interface";
import { MedicalRecord } from "../user/entities/medicalRecord.entity";
import { IMedicalRecord } from "src/shared/interfaces/medical_record_interface/medical_record.interface";
import { User } from "../user/entities/user.entity";

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private readonly _patientRepository: Repository<Patient>,
        @InjectRepository(MedicalRecord)
        private readonly _medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(User)
        private readonly _userRepository: Repository<User>
    ) {}

    async registerPatient(userId: number,body: IPatient) {
        try {
            const { name,birthday, gender, phone, email } = body;

            const patientAlreadyExists = await this._patientRepository.findOne({
                where: { email, professional: {id: userId} }
            });

            if (patientAlreadyExists) {
                throw new ConflictException("Você já cadastrou um paciente com esse e-mail");
            }

            const professional = await this._userRepository.findOne({where: {id: userId}})
    
            if(!professional){
                throw new NotFoundException("Houve um problema ao carregar seu perfil")
            }

            const newPatient = this._patientRepository.create({ 
                name: name,
                birthday: birthday, 
                gender: gender, 
                phone: phone,
                email: email,
                professional: professional
            });
            return await this._patientRepository.save(newPatient);
        } catch (error) {
            throw error;
        }
    }

    async registerMedicalRecord(patientId: number, body: IMedicalRecord): Promise<MedicalRecord> {
        try {
            const patient = await this._patientRepository.findOne({
                where: { id: patientId }
            });

            if (!patient) {
                throw new NotFoundException("Paciente não encontrado");
            }

            const newMedicalRecord = this._medicalRecordRepository.create({
                diagnosis: body.diagnosis,
                plan: body.plan,
                observations: body.observations,
                patient
            });

            return await this._medicalRecordRepository.save(newMedicalRecord);
        } catch (error) {
            throw error;
        }
    }
}
