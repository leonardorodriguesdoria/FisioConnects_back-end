import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedicalRecord } from "src/user/entities/medicalRecord.entity";

@Entity('evolução')
export class Evolution{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => MedicalRecord, medicalRecord => medicalRecord.patient)
    medicalRecord: MedicalRecord;
}