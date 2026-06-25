import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../entities/user.entity";

@Entity('paciente')
export class Patient {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    birthday: Date

    @Column()
    gender: string;

    @Column({unique: true})
    phone: string;

    @Column()
    email:string;

    @ManyToOne(() => User, user => user.patients)
    professional: User;
}