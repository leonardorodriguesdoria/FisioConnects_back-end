import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/common/utils/hashPassword';
import { OtpService } from 'src/otp/otp.service';
import { OtpTypes } from 'src/otp/types/otpType';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { IUpdateUserProfile } from 'src/shared/interfaces/user_interfaces/updateUser.interface';
import { ICreatePatient } from 'src/shared/interfaces/user_interfaces/createPatient.interface';
import { ICreateProfessional } from 'src/shared/interfaces/user_interfaces/createProfessional.interface';
import { Professional } from 'src/professional/entities/professional.entity';
import { UserTypes } from './types/UserTypes.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private readonly _userRepository: Repository<User>,

    @InjectRepository(Professional)
    private readonly _professionalRepository: Repository<Professional>,

    private readonly _otpService: OtpService,
    private readonly _emailService: EmailService,
    private readonly _configService: ConfigService
  ){}

  async createPatient(body:ICreatePatient): Promise<void>{
      const {email , password } = body;
      
      const userAlreadyExists = await this._userRepository.findOne({where: {email: email}})

      if(userAlreadyExists){
        throw new ConflictException("Já existe um usuário cadastrado com esse e-mail!!!")
      }

      const hashedPassword = await hashPassword(password)

      const newPatient = this._userRepository.create({
        email: email,
        password: hashedPassword,
        role: UserTypes.PATIENT
      });

      await this._userRepository.save(newPatient);
      return this.emailVerification(newPatient, OtpTypes.OTP)
  }

  async createProfessional(body: ICreateProfessional): Promise<void>{
      const {name, email, phone, password, crefito,city, specialties, description} = body;

      const userAlreadyExists =await this._userRepository.findOne({where:{email: email}});

      if(userAlreadyExists){
        throw new ConflictException(
            "Já existe um usuário cadastrado com esse e-mail."
        );
      }

      const professionalWithCrefito = await this._professionalRepository.findOne({where: {crefito: crefito}});

      if(professionalWithCrefito){
        throw new ConflictException("Já existe um profissional cadastrado com esse CREFITO")
      }

      const hashedPassword = await hashPassword(password)

      const newUser = this._userRepository.create({
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
        role: UserTypes.PROFESSIONAL
      });

      await this._userRepository.save(newUser);

      const newProfessional = this._professionalRepository.create({
        crefito:crefito,
        city: city,
        description: description,
        specialties: specialties,
        user: newUser
      })

      await this._professionalRepository.save(newProfessional);

      return this.emailVerification(newUser, OtpTypes.OTP)
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

  async getAllUsers(): Promise<Partial<User>[]> {
    const users = await this._userRepository.find();

    if (users.length === 0) {
      throw new NotFoundException("Nenhum usuário encontrado em nossos registros");
    }

    return users;
  }

  async getOneUser(id: number){
    try{
      const user = await this._userRepository.findOne({where: {id: id}})
      if(!user){
        throw new NotFoundException("Usuário não encontrado")
      }
      return user;
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

      return updatedUser;
    }catch(error){
      throw new InternalServerErrorException(
        'Erro interno do sistema. Por favor tente mais tarde',
      );
    }
  }

  async deleteUser(id: number){
    const user = await this._userRepository.findOne({where: {id: id}});
    if(!user){
      throw new NotFoundException("Algo deu errado no carregamento do perfil. Por favor, tente mais tarde")
    }
    await this._userRepository.delete(id)
    return true;
  }
}
