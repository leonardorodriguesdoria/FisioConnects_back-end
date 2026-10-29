import { ApiProperty } from '@nestjs/swagger';
import { UserTypes } from 'src/user/types/UserTypes.enum';

/**Dados do usuário autenticado (o token em si vai apenas no cookie `access_token`) */
export class AuthenticatedUserDto {
    @ApiProperty({ description: 'ID interno do usuário', example: 12 })
    userId!: number;

    @ApiProperty({ example: 'Maria Silva' })
    name!: string;

    @ApiProperty({ example: 'maria.silva@email.com' })
    email!: string;

    @ApiProperty({ description: 'URL da foto de perfil', example: 'https://res.cloudinary.com/demo/image/upload/v1/profile.jpg' })
    profilePicture!: string;

    @ApiProperty({ description: 'Perfil do usuário', enum: UserTypes, enumName: 'UserTypes', example: UserTypes.PATIENT })
    role!: UserTypes;
}

/**Resposta do login quando a conta ainda não foi verificada e o OTP não foi informado */
export class PendingVerificationResponseDto {
    @ApiProperty({
        example: 'Sua conta ainda não está verificada. Por favor conclua o processo de verificação',
    })
    message!: string;
}
