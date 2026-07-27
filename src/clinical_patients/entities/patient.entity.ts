import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MedicalRecord } from "src/medical_record/entities/medicalRecord.entity";
import { Professional } from "src/professional/entities/professional.entity";

@Entity('paciente_clinico')
export class ClinicalPatient {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    birthday: Date

    @Column({nullable: false})
    gender: string;

    @Column({nullable: false})
    phone: string;

    @Column()
    email:string;

    @Column({nullable: false})
    address: string;

    @Column()
    profession:string;

    @Column()
    nationality: string;

    @Column({default: 'https://ibb.co/27mgpNMx'})
    picture: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Professional, professional => professional.patients, {onDelete: 'CASCADE'})
    professional: Professional;

    @OneToMany(() => MedicalRecord, medicalRecord => medicalRecord.patient)
    medicalRecord: MedicalRecord[];
}