import { Professional } from "src/professional/entities/professional.entity";
import { User } from "src/user/entities/user.entity";
import { Check, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity('avaliacao')
@Unique(['patient', 'professional'])
@Check(`"rating" >= 1 AND "rating" <=5`)
export class Evaluation {

    @PrimaryGeneratedColumn()
    id!:number;

    @Column({unique: true, nullable: false})
    publicId!: string;

    @Column({type: 'smallint', nullable: false})
    rating!:number;

    @Column({type: 'text', nullable: true})
    comment!:string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => User, user => user.evaluations, {onDelete: 'CASCADE'})
    patient!: User;

    @ManyToOne(() => Professional, professional => professional.evaluations, {onDelete: 'CASCADE'})
    professional!: Professional
}
