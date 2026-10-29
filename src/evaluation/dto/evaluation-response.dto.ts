import { ApiProperty } from '@nestjs/swagger';

export class EvaluationResponseDto {
    @ApiProperty({ description: 'Identificador público da avaliação', example: 'pQ8r_2sT4uV6wX8yZ0aBc' })
    publicId!: string;

    @ApiProperty({ type: 'integer', minimum: 1, maximum: 5, example: 5 })
    rating!: number;

    @ApiProperty({ type: String, nullable: true, example: 'Excelente profissional, muito atencioso!' })
    comment!: string | null;

    @ApiProperty({ format: 'date-time', example: '2026-10-29T14:30:00.000Z' })
    createdAt!: string;
}

export class EvaluationAuthorDto {
    @ApiProperty({ example: 'Maria Silva' })
    name!: string;

    @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1/profile.jpg' })
    profilePicture!: string;
}

export class EvaluationWithAuthorResponseDto extends EvaluationResponseDto {
    @ApiProperty({ description: 'Paciente que fez a avaliação', type: EvaluationAuthorDto })
    patient!: EvaluationAuthorDto;
}
