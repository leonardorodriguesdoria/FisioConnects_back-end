import { ApiProperty } from '@nestjs/swagger';

export class FavoriteProfessionalDto {
    @ApiProperty({ example: 'V1StGXR8_Z5jdHi6B-myT' })
    publicId!: string;

    @ApiProperty({ example: 'Dr. João Pereira' })
    name!: string;

    @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1/profile.jpg' })
    profilePicture!: string;

    @ApiProperty({ example: 'Fisioterapeuta com 10 anos de experiência em reabilitação esportiva.' })
    description!: string;

    @ApiProperty({ type: [String], example: ['Ortopedia', 'Fisioterapia esportiva'] })
    specialties!: string[];

    @ApiProperty({ example: 'São Paulo' })
    city!: string;
}

export class FavoriteResponseDto {
    @ApiProperty({ description: 'Data em que o profissional foi favoritado', format: 'date-time', example: '2026-10-29T14:30:00.000Z' })
    favoritedAt!: string;

    @ApiProperty({ type: FavoriteProfessionalDto })
    professional!: FavoriteProfessionalDto;
}
