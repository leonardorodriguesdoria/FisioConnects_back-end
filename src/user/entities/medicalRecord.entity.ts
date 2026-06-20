import { Column, CreateDateColumn, Entity, ManyToOne,PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "../patients/entities/patient.entity";

@Entity('prontuario')
export class MedicalRecord{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable: false})
    diagnosis:string;

    @Column()
    plan:string; 

    @Column()
    observations: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Patient)
    patient: Patient;
}