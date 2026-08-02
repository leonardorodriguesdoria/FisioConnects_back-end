import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ClinicalPatient } from "./entities/patient.entity";
import { Repository } from "typeorm";
import { IPatient } from "src/shared/interfaces/patient_interface/patient_interface";
import { MedicalRecord } from "../medical_record/entities/medicalRecord.entity";
import { IMedicalRecord } from "src/shared/interfaces/medical_record_interface/medical_record.interface";
import { User } from "../user/entities/user.entity";
import { IUpdateUserInterface } from "src/shared/interfaces/patient_interface/updateUser.interface";

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(ClinicalPatient)
        private readonly _patientRepository: Repository<ClinicalPatient>,
        @InjectRepository(MedicalRecord)
        private readonly _medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(User)
        private readonly _userRepository: Repository<User>
    ) {}

    async registerPatient(userId: number,body: IPatient) {
        try {
            const { name,birthday, gender, phone, email, address, profession, nationality, picture } = body;

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
                address: address,
                profession: profession,
                nationality: nationality,
                picture: picture,
                professional: professional
            });
            return await this._patientRepository.save(newPatient);
        } catch (error) {
            throw error;
        }
    }

    async getAllPatients(userId: number): Promise<Partial<ClinicalPatient>[]>{
        const patients = await this._patientRepository.find({where: {professional: {id: userId}}});

        if(patients.length == 0){
            throw new NotFoundException("Nenhum paciente cadastrado")
        }
        return patients;
    }

    async getPatient(userId: number, patientId: number){
        try{
            const patient = await this._patientRepository.findOne({where: {professional: {id: userId}, id: patientId}})
            if(!patient){
                throw new NotFoundException("Paciente não encontrado")
            }
            return patient;
        }catch(error){
            throw new InternalServerErrorException("Erro Interno do sistema.Por favor, tente mais tarde")
        }
    }


    async updatePatient(userId: number, patientId: number, body: IUpdateUserInterface){
        try{
            const patient = await this._patientRepository.findOne({where: {professional: {id: userId}, id: patientId}})
            if(!patient){
                throw new NotFoundException("Usuário não encontrado!!!!")
            }
            if(body.email && body.email !== patient.email){
                const emailInUse = await this._userRepository.findOne({
                where: {email: body.email}
            });
            if(emailInUse){
                    throw new ConflictException("Este e-mail já está sendo usado por outro usuário");
                }
            }
            Object.assign(patient, body);
            const updatedPatient = await this._patientRepository.save(patient);
            return updatedPatient; 
        }catch(error){
            throw new InternalServerErrorException("Erro no sistema. Por favor tente novamente mais tarde")
        }
    }

    async deletePatient(userId: number, patientId: number){
        const patient = await this._patientRepository.findOne({where: {professional: {id: userId}, id: patientId}})
        if(!patient){
            throw new NotFoundException("Ocorreu um erro inesperado. Perfil do paciente não foi encontrado!!!")
        }
        await this._patientRepository.delete(patientId);
        return true;
    }

    /*-----------------FUNÇÕES DE GERENCIAMENTO DE PRONTUÁRIO---------------*/

    async registerMedicalRecord(patientId: number, body: IMedicalRecord): Promise<MedicalRecord> {
        try {
            const patient = await this._patientRepository.findOne({
                where: { id: patientId }
            });

            if (!patient) {
                throw new NotFoundException("Paciente não encontrado");
            }

            const newMedicalRecord = this._medicalRecordRepository.create({
                date: body.date,
                chiefComplaint: body.chiefComplain,
                diagnosis: body.diagnosis,
                treatmentPlan: body.treatmentPlan,
                observations: body.observations,
                patient,
            });

            return await this._medicalRecordRepository.save(newMedicalRecord);
        } catch (error) {
            throw error;
        }
    }
}
