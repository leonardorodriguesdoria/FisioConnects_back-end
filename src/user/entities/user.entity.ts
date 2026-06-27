import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

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

  @Column({ unique: true })
  crefito: string;

  @Column({nullable: false})
  city: string;

  @Column()
  description: string;

  @Column({ default: 'https://ibb.co/27mgpNMx' })
  profilePicture: string;

  @Column("text", {array: true})
  specialties: string[];

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiresAt: Date;

  @Column({ default: 'unverified' })
  accountStatus: 'verified' | 'unverified';

  @OneToMany(() => Patient, patient => patient.professional)
  patients: Patient[]
}
