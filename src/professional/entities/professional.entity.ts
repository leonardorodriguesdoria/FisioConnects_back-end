import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { ClinicalPatient } from "src/clinical_patients/entities/patient.entity";

@Entity('profissional')
export class Professional {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    crefito: string;

    @Column()
    description: string;

    @Column("text", {array: true})
    specialties: string[];

    @Column({nullable: false})
    city: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @OneToMany(() => ClinicalPatient, patient => patient.professional)
    patients: ClinicalPatient[];
}