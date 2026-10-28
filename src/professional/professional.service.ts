import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';
import { hashPassword } from 'src/common/utils/hashPassword';
import { ICreateProfessional } from 'src/shared/interfaces/user_interfaces/createProfessional.interface';
import { User } from 'src/user/entities/user.entity';
import { UserTypes } from 'src/user/types/UserTypes.enum';
import { AuthService } from 'src/auth/auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { nanoid } from "nanoid";

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(User) 
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Professional)
    private readonly _professionalRepository: Repository<Professional>,

    private readonly _authService: AuthService,

    private readonly _cloudinaryService: CloudinaryService
){}

    async createProfessional(body: ICreateProfessional, image?: Express.Multer.File): Promise<boolean>{
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

        const uploadedImage = image
            ? await this._cloudinaryService.uploadProfilePicture(image)
            : undefined;

        const newUser = this._userRepository.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: UserTypes.PROFESSIONAL,
            ...(uploadedImage && {
                profilePicture: uploadedImage.secureUrl,
                profilePicturePublicId: uploadedImage.publicId
            })
        });

        await this._userRepository.manager.transaction(async manager => {
            await manager.save(newUser);

            const newProfessional = manager.create(Professional, {
                publicId: nanoid(),
                phone: phone,
                city: city,
                description: description,
                specialties: specialties,
                user: newUser
            });

            await manager.save(newProfessional);
        });

        return this._authService.sendVerificationCodeAfterSignup(newUser)
    }

    async getProfessionalByPublicId(publicId: string){
        const professional = await this._professionalRepository.findOne({
            where: {publicId: publicId},
            relations: {user: true}
        });

        if(!professional){
            throw new NotFoundException('Profissional não encontrado');
        }

        const stats: {average: string | null; total: string} | undefined = await this._professionalRepository
          .createQueryBuilder('professional')
          .leftJoin('professional.evaluations', 'evaluation')
          .select('AVG(evaluation.rating)', 'average')
          .addSelect('COUNT(evaluation.id)', 'total')
          .where('professional.id = :id', {id: professional.id})
          .getRawOne();

        return {
            publicId: professional.publicId,
            name: professional.user.name,
            description: professional.description,
            specialties: professional.specialties,
            city: professional.city,
            phone: professional.phone,
            profilePicture: professional.user.profilePicture,
            averageRating: stats?.average ? Math.round(Number(stats.average) * 10) / 10 : 0,
            totalEvaluations: stats ? Number(stats.total) : 0
        };
    }
}
