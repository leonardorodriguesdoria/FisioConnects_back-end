import { Column, CreateDateColumn, Entity, ManyToOne,OneToMany,PrimaryGeneratedColumn } from "typeorm";
import { ClinicalPatient } from "../../clinical_patients/entities/patient.entity";
import { Evolution } from "src/clinical_patients/entities/evolution.entity";

@Entity('prontuario')
export class MedicalRecord{

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    date!: Date;

    @Column({ nullable: false })
    chiefComplaint!: string;

    @Column({ nullable: false })
    diagnosis!: string;

    @Column()
    treatmentPlan!: string; 

    @Column()
    observations!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => ClinicalPatient, patient => patient.medicalRecord, { onDelete: 'CASCADE' })
    patient!: ClinicalPatient;

    @OneToMany(() => Evolution, evolution => evolution.medicalRecord)
    evolution!: Evolution[];
}