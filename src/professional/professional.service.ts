import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';
import { hashPassword } from 'src/common/utils/hashPassword';
import { OtpTypes } from 'src/otp/types/otpType';
import { ICreateProfessional } from 'src/shared/interfaces/user_interfaces/createProfessional.interface';
import { User } from 'src/user/entities/user.entity';
import { UserTypes } from 'src/user/types/UserTypes.enum';
import { AuthService } from 'src/auth/auth.service';
import { nanoid } from "nanoid";

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(User) 
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Professional)
    private readonly _professionalRepository: Repository<Professional>,

    private readonly _authService: AuthService
){}


    async createProfessional(body: ICreateProfessional): Promise<void>{
        const {name, email, phone, password,city, specialties, description} = body;

        const userAlreadyExists =await this._userRepository.findOne({where:{email: email}});

        if(userAlreadyExists){
            throw new ConflictException("Já existe um usuário cadastrado com esse e-mail.");
        }

        const phoneAlreadySaved = await this._professionalRepository.findOne({where: {phone: phone}})
        
        if(phoneAlreadySaved){
            throw new ConflictException("Esse número de telefone já se encontra cadastrado")
        }

        const hashedPassword = await hashPassword(password)

        const newUser = this._userRepository.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: UserTypes.PROFESSIONAL
        });

        await this._userRepository.save(newUser);

        const newProfessional = this._professionalRepository.create({
            publicId: nanoid(),
            phone: phone,
            city: city,
            description: description,
            specialties: specialties,
            user: newUser
        })

        await this._professionalRepository.save(newProfessional);

        return this._authService.emailVerification(newUser, OtpTypes.OTP)
    }
}
