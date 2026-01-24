import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { OTP } from './entities/otp.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from 'src/user/entities/user.entity';
import { OtpTypes } from './types/otpType';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OTP)
    private otpRepository: Repository<OTP>,
  ) {}


  async generateOTP(
    user: User,
    type: OtpTypes,
  ): Promise<string> {
    //Gera um código OTP de 6 digítos
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    //Cria uma entidade de OTP
    const otpEntity = this.otpRepository.create({
      user,
      token: hashedOTP,
      type,
      expiresAt,
    });

    await this.otpRepository.save(otpEntity);

    return otp;
  }

  async validateOtp(userId: number, token: string): Promise<boolean>{
    const validToken = await this.otpRepository.findOne({
      where: {
        user: {id: userId},
        expiresAt: MoreThan(new Date())
      }
    });
    if(!validToken){
      throw new BadRequestException('Código de verificação expirou. Por favor, solicite um novo')
    }
    const isMatch = await bcrypt.compare(token, validToken.token)
    if(!isMatch){
      throw new BadRequestException('Código inválido. Tente novamente')
      
    }
    return true;
  }
  
}
