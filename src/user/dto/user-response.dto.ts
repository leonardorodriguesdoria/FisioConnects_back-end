import { ApiProperty } from '@nestjs/swagger';
import { AuthenticatedUserDto } from 'src/auth/dto/auth-response.dto';
import { UserTypes } from '../types/UserTypes.enum';

export class ProfessionalDetailsDto {
    @ApiProperty({ example: 'V1StGXR8_Z5jdHi6B-myT' })
    publicId!: string;

    @ApiProperty({ example: 'Fisioterapeuta com 10 anos de experiência em reabilitação esportiva.' })
    description!: string;

    @ApiProperty({ type: [String], example: ['Ortopedia', 'Fisioterapia esportiva'] })
    specialties!: string[];

    @ApiProperty({ example: 'São Paulo' })
    city!: string;

    @ApiProperty({ example: '+5511999999999' })
    phone!: string;
}

export class UserProfileResponseDto {
    @ApiProperty({ description: 'ID interno do usuário', example: 12 })
    id!: number;

    @ApiProperty({ example: 'Dr. João Pereira' })
    name!: string;

    @ApiProperty({ example: 'joao.pereira@email.com' })
    email!: string;

    @ApiProperty({ enum: UserTypes, enumName: 'UserTypes', example: UserTypes.PROFESSIONAL })
    role!: UserTypes;

    @ApiProperty({ description: 'URL da foto de perfil', example: 'https://res.cloudinary.com/demo/image/upload/v1/profile.jpg' })
    profilePicture!: string;

    @ApiProperty({
        description: 'Dados profissionais. `null` quando o usuário é um paciente',
        type: ProfessionalDetailsDto,
        nullable: true,
    })
    professional!: ProfessionalDetailsDto | null;
}

export class UpdateProfileResponseDto {
    @ApiProperty({ example: 'Dados do perfil atualizados com sucesso!' })
    message!: string;

    @ApiProperty({ description: 'Dados atualizados do usuário', type: AuthenticatedUserDto })
    user!: AuthenticatedUserDto;
}
