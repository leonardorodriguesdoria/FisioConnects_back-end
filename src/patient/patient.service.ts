import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { hashPassword } from 'src/common/utils/hashPassword';
import { ICreatePatient } from 'src/shared/interfaces/user_interfaces/createPatient.interface';
import { User } from 'src/user/entities/user.entity';
import { UserTypes } from 'src/user/types/UserTypes.enum';
import { Repository } from 'typeorm';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(User) 
        private readonly _userRepository: Repository<User>,
        
        private readonly _authService: AuthService,

        private readonly _cloudinaryService: CloudinaryService
    ){}

    async createPatient(body:ICreatePatient, image?: Express.Multer.File): Promise<boolean>{
          const {name ,email , password } = body;
          
          const userAlreadyExists = await this._userRepository.findOne({where: {email: email}})
    
          if(userAlreadyExists){
            throw new ConflictException("Já existe um usuário cadastrado com esse e-mail!!!")
          }
    
          const hashedPassword = await hashPassword(password)

          const uploadedImage = image
            ? await this._cloudinaryService.uploadProfilePicture(image)
            : undefined;

          const newPatient = this._userRepository.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: UserTypes.PATIENT,
            ...(uploadedImage && {
              profilePicture: uploadedImage.secureUrl,
              profilePicturePublicId: uploadedImage.publicId
            })
          });
    
          await this._userRepository.save(newPatient);
          return this._authService.sendVerificationCodeAfterSignup(newPatient)
      }
}
