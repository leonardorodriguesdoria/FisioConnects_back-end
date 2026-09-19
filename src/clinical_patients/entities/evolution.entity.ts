import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedicalRecord } from "src/medical_record/entities/medicalRecord.entity";

@Entity('evolucao')
export class Evolution{

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    description!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => MedicalRecord, medicalRecord => medicalRecord.evolution, { onDelete: 'CASCADE' })
    medicalRecord!: MedicalRecord;
}