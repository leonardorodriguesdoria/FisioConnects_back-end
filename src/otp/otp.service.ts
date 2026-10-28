import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { OTP } from './entities/otp.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from 'src/user/entities/user.entity';
import { OtpTypes } from './types/otpType';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OTP)
    private otpRepository: Repository<OTP>,
    private readonly _jwtService:JwtService,
    private readonly configService: ConfigService
  ) {}


  async generateToken(
  user: User,
  type: OtpTypes,
): Promise<string> {

  if (type === OtpTypes.OTP) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const existingOTP = await this.otpRepository.findOne({
      where: { user: { id: user.id }, type }
    });

    if (existingOTP) {
      existingOTP.token = hashedOTP;
      existingOTP.expiresAt = expiresAt;
      await this.otpRepository.save(existingOTP);
    } else {
      const otpEntity = this.otpRepository.create({
        user,
        token: hashedOTP,
        type,
        expiresAt,
      });
      await this.otpRepository.save(otpEntity);
    }

    return otp;
  }else if(type === OtpTypes.RESET_LINK) {
    const resetToken = this._jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: this.resetSecret(user.password),
        expiresIn: '15m',
      },
    );
    return resetToken;
  }
  throw new Error('Tipo de token não suportado');
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

  private resetSecret(passwordHash: string){
    return `${this.configService.getOrThrow<string>('JWT_RESET_SECRET')}${passwordHash}`;
  }

  getResetTokenUserId(token: string): number{
    const decoded = this._jwtService.decode(token);
    const userId = Number(decoded?.id);
    if(!Number.isInteger(userId) || userId <= 0){
      throw new BadRequestException('Token inválido. Por favor solicite um novo e-mail de redefinição');
    }
    return userId;
  }

  //Função de validação de redefinição de senha
  async validateResetPassword(token: string, passwordHash: string){
    try{
      const decoded = this._jwtService.verify(token, {
        secret: this.resetSecret(passwordHash)
      });
      return decoded.id;
    }catch(error){
      if(error?.name === 'TokenExpiredError'){
        throw new BadRequestException(
          'O link de redefinição de senha expirou.\nPor favor solicite um novo'
        );
      }
      throw new BadRequestException('Token inválido. Por favor solicite um novo e-mail de redefinição')
    }
  }
}
