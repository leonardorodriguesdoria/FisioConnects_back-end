import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserTypes } from '../types/UserTypes.enum';

@Entity('usuário')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({unique: true})
  phone: string;

  @Column()
  password: string;

  @Column({
        type: 'enum',
        enum: UserTypes
  })
  role: UserTypes;

  @Column({ default: 'https://ibb.co/27mgpNMx' })
  profilePicture: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiresAt: Date;

  @Column({ default: 'unverified' })
  accountStatus: 'verified' | 'unverified';

  @CreateDateColumn()
  createdAt: Date;
}
