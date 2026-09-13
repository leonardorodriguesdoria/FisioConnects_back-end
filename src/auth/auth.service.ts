import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IUserLogin } from 'src/shared/interfaces/user_interfaces/loginUser.interface';
import { comparePassword } from 'src/common/utils/hashPassword';
import { OtpService } from 'src/otp/otp.service';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { OtpTypes } from 'src/otp/types/otpType';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'user';
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly _jwtService: JwtService,
    private readonly _otpService: OtpService,
    private readonly _emailService: EmailService,
    private readonly _configService: ConfigService
){}

createToken(user: User) {
    return {
      access_token: this._jwtService.sign(
        {
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '3 days',
          subject: String(user.id),
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
      userId: user.id,
      email: user.email
    };
  }

  checkToken(token: string) {
    try {
      const data = this._jwtService.verify(token, {
        audience: this.audience,
        issuer: this.issuer,
      });
      return data;
    } catch (error) {
      throw new BadRequestException(
        'Ocorreu um erro na autenticação. Tente mais tarde',
      );
    }
  }

  async userLogin(body: IUserLogin){
    try{
      const {email, password, otp} = body
      const user = await this._userRepository.findOne({where: {email: email}})
      if(!user){
        throw new NotFoundException("Usuário não encontrado. Por favor verifique os dados inseridos")
      }
      const isValidPassword = await comparePassword(user.password, password);
      if(!isValidPassword){
        throw new UnauthorizedException("Senha incorreta")
      }
      if(user.accountStatus === 'unverified'){
        if(!otp){
          return{
            message: 'Sua conta ainda não está verificada. Por favor conclua o processo de verificação'
          }
        } else {
          await this.verifyToken(user.id, otp);
        }
      }
      return this.createToken(user)
    }catch(error){
      if(error instanceof HttpException || error instanceof BadRequestException){
        throw error
      }
      throw new InternalServerErrorException(
        'Erro interno no sistema. Por favor, tente mais tarde'
      )
    }
  }

  async verifyToken(userId: number, token: string){
    await this._otpService.validateOtp(userId, token)

    const user = await this._userRepository.findOne({
      where: {id: userId},
    })
    if(!user){
      throw new UnauthorizedException("Usuário não encontrado")
    }
    user.accountStatus = 'verified'
    return await this._userRepository.save(user);
  }


  //Enviar código de verificação o link de reset via email
  async emailVerification(user: User, otpType: OtpTypes){
      const token = await this._otpService.generateToken(user, otpType)
  
      if(otpType === OtpTypes.OTP){
        const emailDto = {
        recipients: [user.email],
        subject: "Código para verificação de conta",
        html: `Seu código de verificação de conta é: <strong>${token}</strong>`
      }
  
      //Envia código de verificação para o e-mail
      return await this._emailService.sendEmail(emailDto)
    }else if(otpType === OtpTypes.RESET_LINK){
      const resetLink = `${this._configService.get('RESET_PASSWORD_URL')}?token=${token}`
      const emailDto = {
        recipients: [user.email],
        subject: "Link de redefinição de senha",
        html: `Clique no link a seguir para redefinir sua senha: <p><a href="${resetLink}">Redefinir Senha</a></p>`
      };
  
      //Envia o link de redefinição de senha via e-mail
      return await this._emailService.sendEmail(emailDto)
    }
  }
    
    //Verifica se o e-mail informado está cadastrado para requisição de um novo código de verificação
  async findByEmail(email: string){
      return await this._userRepository.findOne({where: {email: email}})
  }

  async resetPassword(token: string, newPassword: string): Promise<string>{
    const userId = await this._otpService.validateResetPassword(token)
    const user = await this._userRepository.findOne({where: {id: userId}});
    
    if(!user){
      throw new BadRequestException('Usuário não encontrado')
    }
    
    user.password = await argon2.hash(newPassword);
    await this._userRepository.save(user);
    
    return 'Senha redefinida com sucesso!!!'
  }
}

