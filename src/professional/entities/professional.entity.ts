import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { ClinicalPatient } from "src/clinical_patients/entities/patient.entity";
import { Evaluation } from "src/evaluation/entities/evaluation.entity";
import { Favorite } from "src/favorites/entities/favorite.entity";

@Entity('profissional')
export class Professional {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true, nullable: false})
    publicId!:string;

    @Column({ unique: true })
    phone!: string;

    @Column()
    description!: string;

    @Column("text", { array: true })
    specialties!: string[];

    @Column({ nullable: false })
    city!: string;

    @OneToOne(() => User, user => user.professional, { onDelete: 'CASCADE' })
    @JoinColumn()
    user!: User;

    @OneToMany(() => ClinicalPatient, patient => patient.professional)
    patients!: ClinicalPatient[];

    @OneToMany(() => Evaluation, evaluation => evaluation.professional)
    evaluations!: Evaluation[];

    @OneToMany(() => Favorite, favorite => favorite.professional)
    favorites!: Favorite[];
}