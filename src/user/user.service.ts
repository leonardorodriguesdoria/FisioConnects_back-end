import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/hashPassword';
import { ICreateUser } from 'src/shared/interfaces/createUser.interface';
import { OtpService } from 'src/otp/otp.service';
import { OtpTypes } from 'src/otp/types/otpType';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { IUpdateUserProfile } from 'src/shared/interfaces/updateUser.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private readonly _userRepository: Repository<User>,
    private readonly _otpService: OtpService,
    private readonly _emailService: EmailService,
    private readonly _configService: ConfigService
  ){}

  async createUser(body:ICreateUser): Promise<void>{
    try{
      const { name, email, phone, description, password, crefito, specialties } = body;
      
      const userAlreadyExists = await this._userRepository.findOne({where: {email: email}})

      //Verifica se existe algum usuário que já está usando o e-mail informado
      if(userAlreadyExists){
        throw new ConflictException("Já existe um usuário cadastrado com esse e-mail!!!")
      }

      const userWithCrefito = await this._userRepository.findOne({where: {crefito: crefito}})

      if(userWithCrefito){
        throw new ConflictException(
          'Já existe um usuário cadastrado com esse CREFITO',
        );
      }

      const hashedPassword = await hashPassword(password)

      const newUser = this._userRepository.create({
        name: name,
        email: email,
        phone: phone,
        description: description,
        password: hashedPassword,
        crefito: crefito,
        specialties: specialties
      })
      await this._userRepository.save(newUser);
      return this.emailVerification(newUser, OtpTypes.OTP)
    }catch(error){
    if (error.code === '23505') {
      throw new ConflictException(
        'E-mail ou CREFITO já cadastrado',
      );
    }
      throw error;
    }
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

/*------------------------------------------------------------------------------------------- */
  /*FUNÇÕES DE CRUD DE PERFIL DO USUÁRIOS */

  async getOneUser(id: number){
    try{
      const user = await this._userRepository.findOne({where: {id: id}})
      if(!user){
        throw new NotFoundException("Usuário não encontrado")
      }
      const {password,resetToken,resetTokenExpiresAt,accountStatus, ...rest} = user;
      return rest
    }catch(error){
      throw new InternalServerErrorException("Erro interno no sistema. Por favor, tente mais tarde")
    }
  }

  async updateUser(id: number,body: IUpdateUserProfile){
    try{
      const user = await this._userRepository.findOne({where: {id: id}})
      if(!user){
        throw new NotFoundException("Usuário não encontrado!!!!")
      }
      if(body.email && body.email !== user.email){
        const emailInUse = await this._userRepository.findOne({
          where: {email: body.email}
        });
        if(emailInUse){
          throw new ConflictException(
            "Este e-mail já está sendo usado por outro usuário"
          );
        }
      }
      Object.assign(user, body);

      const updatedUser = await this._userRepository.save(user);

      const {password,resetToken,resetTokenExpiresAt,accountStatus, ...response } = updatedUser;

      return response;
    }catch(error){
      throw new InternalServerErrorException(
        'Erro interno do sistema. Por favor tente mais tarde',
      );
    }
  }
}
