import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserTypes } from '../types/UserTypes.enum';
import { Professional } from 'src/professional/entities/professional.entity';

@Entity('usuário')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserTypes
  })
  role!: UserTypes;

  @Column({ default: 'https://ibb.co/27mgpNMx' })
  profilePicture!: string;

  @OneToOne(() => Professional, professional => professional.user)
  professional!: Professional;

  @Column({ nullable: true })
  resetToken!: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiresAt!: Date;

  @Column({ default: 'unverified' })
  accountStatus!: 'verified' | 'unverified';

  @CreateDateColumn()
  createdAt!: Date;
}
