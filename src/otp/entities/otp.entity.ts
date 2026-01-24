
import {
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
} from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { OtpTypes } from '../types/otpType';

@Entity()
export class OTP {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  @Column()
  token: string;

  @Column({ type: 'enum', enum: OtpTypes })
  type: OtpTypes;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}