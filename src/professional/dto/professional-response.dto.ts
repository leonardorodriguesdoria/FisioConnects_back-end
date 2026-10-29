import { ApiProperty } from '@nestjs/swagger';

/**Perfil público do profissional, com a média das avaliações recebidas */
export class ProfessionalPublicProfileDto {
    @ApiProperty({ description: 'Identificador público do profissional', example: 'V1StGXR8_Z5jdHi6B-myT' })
    publicId!: string;

    @ApiProperty({ example: 'Dr. João Pereira' })
    name!: string;

    @ApiProperty({ example: 'Fisioterapeuta com 10 anos de experiência em reabilitação esportiva.' })
    description!: string;

    @ApiProperty({ type: [String], example: ['Ortopedia', 'Fisioterapia esportiva'] })
    specialties!: string[];

    @ApiProperty({ example: 'São Paulo' })
    city!: string;

    @ApiProperty({ example: '+5511999999999' })
    phone!: string;

    @ApiProperty({ description: 'URL da foto de perfil', example: 'https://res.cloudinary.com/demo/image/upload/v1/profile.jpg' })
    profilePicture!: string;

    @ApiProperty({ description: 'Média das notas (1 casa decimal). 0 quando ainda não há avaliações', example: 4.7 })
    averageRating!: number;

    @ApiProperty({ description: 'Quantidade de avaliações recebidas', example: 23 })
    totalEvaluations!: number;
}
