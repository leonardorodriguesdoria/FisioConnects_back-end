import { Professional } from "src/professional/entities/professional.entity";
import { User } from "src/user/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('favorito')
@Unique(['patient', 'professional'])
export class Favorite {

    @PrimaryGeneratedColumn()
    id!:number;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User, user => user.favorites, {onDelete: 'CASCADE'})
    patient!: User;

    @ManyToOne(() => Professional, professional => professional.favorites, {onDelete: 'CASCADE'})
    professional!: Professional
}
