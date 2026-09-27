import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ClinicalPatient } from "./entities/patient.entity";
import { Repository } from "typeorm";
import { IPatient } from "src/shared/interfaces/patient_interface/patient_interface";
import { User } from "../user/entities/user.entity";
import { IUpdateUserInterface } from "src/shared/interfaces/patient_interface/updateUser.interface";
import { Professional } from "src/professional/entities/professional.entity";
import { nanoid } from "nanoid";
import { IEvolution } from "src/shared/interfaces/evoution_interface/evolution.interface";
import { MedicalRecord } from "src/medical_record/entities/medicalRecord.entity";
import { Evolution } from "./entities/evolution.entity";

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Professional)
        private readonly _professionalRepository: Repository<Professional>,
        @InjectRepository(ClinicalPatient)
        private readonly _patientRepository: Repository<ClinicalPatient>,
        @InjectRepository(User)
        private readonly _userRepository: Repository<User>,

        @InjectRepository(MedicalRecord)
        private readonly _medicalRecordRepository: Repository<MedicalRecord>,

        @InjectRepository(Evolution)
        private readonly _evolutionRepository: Repository<Evolution>
    ) {}

    async registerPatient(userId: number,body: IPatient) {
        const {name, birthday, gender, phone, email, address, profession,nationality,picture} = body;

        const professional = await this._professionalRepository.findOne({
            where: {
                user: {
                    id: userId
                }
            }
        });
        
        if(!professional){
            throw new NotFoundException("Houve um problema ao carregar seu perfil");
        }

        const patientAlreadyExists = await this._patientRepository.findOne({
            where: {
                email,
                professional: {
                    id: professional.id
                }
            }
        });

        if(patientAlreadyExists){
            throw new ConflictException("Você já cadastrou um paciente com esse e-mail")
        }

        const newPatient = this._patientRepository.create({
            publicId: nanoid(),
            name: name,
            birthday: birthday,
            gender: gender,
            phone: phone,
            email:email,
            address: address,
            profession: profession,
            nationality: nationality,
            picture: picture,
            professional: professional
        });
        return await this._patientRepository.save(newPatient);
    }

    async getAllPatients(userId: number): Promise<Partial<ClinicalPatient>[]>{
        const professional = await this._professionalRepository.findOne({where: {user: {id: userId}}});

        if(!professional){
            throw new NotFoundException("Profissional não encontrado")
        }

        const patients = await this._patientRepository.find({where: {professional: {id: professional.id}}})

        if (patients.length === 0) {
            throw new NotFoundException("Nenhum paciente cadastrado");
        }

        return patients;
    }

    async getPatient(userId: number, publicId: string){
        try{
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
                throw new NotFoundException("Paciente não encontrado")
            }
            return patient;
        }catch(error){
            throw new InternalServerErrorException("Erro Interno do sistema.Por favor, tente mais tarde")
        }
    }


    async updatePatient(userId: number, publicId: string, body: IUpdateUserInterface){
        try{
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

    async deletePatient(userId: number, publicId: string){
        const patient = await this._patientRepository.findOne({
            where:{
                publicId,
                professional:{
                    user:{
                        id: userId
                    }
                }
            }
        })
        if(!patient){
            throw new NotFoundException("Ocorreu um erro inesperado. Perfil do paciente não foi encontrado!!!")
        }
        await this._patientRepository.remove(patient);
        return true;
    }

    /******=======EVOLUÇÃO DO QUADRO DO PACIENTE=========*/
    async patientEvolution(userId: number,medicalRecordPublicId:string,body: IEvolution){
        const {description} = body;

        const professional = await this._professionalRepository.findOne({
            where:{
                user:{
                    id: userId
                }
            }
        });

        if(!professional){
            throw new NotFoundException("Houve um problema ao carregar seu perfil")
        }

        const medicalRecord = await this._medicalRecordRepository.findOne({
            where:{
                publicId: medicalRecordPublicId,
                patient: {
                    professional:{
                        id: professional.id
                    }
                }
            }
        })

        if(!medicalRecord){
            throw new NotFoundException("Prontuário não encontrado ou não pertence ao profissional");
        }

        const evolution = this._evolutionRepository.create({
            description: description,
            medicalRecord: medicalRecord
        })

        return await this._evolutionRepository.save(evolution);
    }

    async listEvolutions(userId: number,medicalRecordPublicId:string){
        const professional = await this._professionalRepository.findOne({
            where: {
            user: {
                id: userId,
                },
            },
        });

        if (!professional) {
            throw new NotFoundException('Houve um problema ao carregar seu perfil');
        }

        const medicalRecord = await this._medicalRecordRepository.findOne({
            where: {
            publicId: medicalRecordPublicId,
            patient: {
                professional: {
                id: professional.id,
                    },
                },
            },
        });

        if(!medicalRecord){
            throw new NotFoundException('Prontuário não encontrado')
        }

        const evolutions = await this._evolutionRepository.find({
            where: {
            medicalRecord: {
                id: medicalRecord.id,
                },
            },
            order: {
            createdAt: 'ASC',
            },
        });

        if(evolutions.length === 0){
            throw new NotFoundException('Nenhuma evolução encontrada para este prontuário')
        }

        return evolutions;
    }
}
