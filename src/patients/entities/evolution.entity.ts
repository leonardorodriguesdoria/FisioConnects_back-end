import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./patient.entity";

@Entity('evolução')
export class Evolution{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Patient)
    patient: Patient;
}