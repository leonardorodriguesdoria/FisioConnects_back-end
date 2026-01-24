import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IUserLogin } from 'src/shared/interfaces/loginUser.interface';
import { comparePassword } from 'src/utils/hashPassword';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'user';
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly _jwtService: JwtService
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
      const {email, password} = body
      const user = await this._userRepository.findOne({where: {email: email}})
      if(!user){
        throw new NotFoundException("Usuário não encontrado. Por favor verifique os dados inseridos")
      }
      const isValidPassword = await comparePassword(password, user.password);
      if(!isValidPassword){
        throw new UnauthorizedException("Senha incorreta")
      }
      return this.createToken(user)
    }catch(error){
      if(error instanceof HttpException){
        throw error
      }
      throw new InternalServerErrorException(
        'Erro interno no sistema. Por favor, tente mais tarde'
      )
    }
  }
}
