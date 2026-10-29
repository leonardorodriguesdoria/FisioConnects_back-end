import { ApiProperty } from '@nestjs/swagger';

export class ClinicalPatientResponseDto {
    @ApiProperty({ description: 'ID interno do paciente', example: 7 })
    id!: number;

    @ApiProperty({ description: 'Identificador público do paciente clínico', example: 'Uakgb_J5m9g-0JDMbcJqL' })
    publicId!: string;

    @ApiProperty({ example: 'Carlos Oliveira' })
    name!: string;

    @ApiProperty({ format: 'date', example: '1988-04-15' })
    birthday!: string;

    @ApiProperty({ example: 'Masculino' })
    gender!: string;

    @ApiProperty({ example: '+5511977776666' })
    phone!: string;

    @ApiProperty({ example: 'carlos.oliveira@email.com' })
    email!: string;

    @ApiProperty({ example: 'Rua das Flores, 123 - Centro, São Paulo/SP' })
    address!: string;

    @ApiProperty({ example: 'Engenheiro' })
    profession!: string;

    @ApiProperty({ example: 'Brasileira' })
    nationality!: string;

    @ApiProperty({ description: 'Caminho/URL da foto do paciente', example: 'https://ibb.co/27mgpNMx' })
    picture!: string;
}

export class EvolutionResponseDto {
    @ApiProperty({ description: 'ID interno da evolução', example: 31 })
    id!: number;

    @ApiProperty({ example: 'Paciente relata redução da dor lombar. Ganho de 10° de amplitude na flexão do tronco.' })
    description!: string;

    @ApiProperty({ description: 'Data e hora do registro', format: 'date-time', example: '2026-10-29T14:30:00.000Z' })
    createdAt!: string;
}
