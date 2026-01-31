import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IUserLogin } from 'src/shared/interfaces/loginUser.interface';
import { comparePassword } from 'src/utils/hashPassword';
import { OtpService } from 'src/otp/otp.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'user';
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly _jwtService: JwtService,
    private readonly _otpService: OtpService
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

  //Login Usuário
  async userLogin(body: IUserLogin){
    try{
      const {email, password, otp} = body
      const user = await this._userRepository.findOne({where: {email: email}})
      if(!user){
        throw new NotFoundException("Usuário não encontrado. Por favor verifique os dados inseridos")
      }
      const isValidPassword = await comparePassword(password, user.password);
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
    //Se o código é válido, a conta é verificada
    user.accountStatus = 'verified'
    return await this._userRepository.save(user);
  }

  //Função de redefinição de senha
  async resetPassword(token: string, newPassword: string): Promise<string>{
    const userId = await this._otpService.validateResetPassword(token)
    const user = await this._userRepository.findOne({where: {id: userId}});
    if(!user){
      throw new BadRequestException('Usuário não encontrado')
    }
    //criptografa a nova senha e atualiza a entidade do usuário
    user.password = await bcrypt.hash(newPassword, 10);
    await this._userRepository.save(user);
    
    return 'Senha redefinida com sucesso!!!'
  }
}

