import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { MedicalRecord } from "src/user/entities/medicalRecord.entity";

@Entity('paciente')
export class Patient {

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

    @ManyToOne(() => User, user => user.patients, {onDelete: 'CASCADE'})
    professional: User;

    @OneToMany(() => MedicalRecord, medicalRecord => medicalRecord.patient)
    medicalRecord: MedicalRecord[]
}