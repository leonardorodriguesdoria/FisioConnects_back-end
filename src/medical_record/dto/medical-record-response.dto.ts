import { ApiProperty } from '@nestjs/swagger';

export class MedicalRecordPatientDto {
    @ApiProperty({ example: 'Uakgb_J5m9g-0JDMbcJqL' })
    publicId!: string;

    @ApiProperty({ example: 'Carlos Oliveira' })
    name!: string;
}

export class MedicalRecordResponseDto {
    @ApiProperty({
        description: 'Identificador público do prontuário (usado nas rotas de evoluções)',
        example: 'kF3x9_LmQpZ7aB2cD4eFg',
    })
    publicId!: string;

    @ApiProperty({ format: 'date-time', example: '2026-10-29T00:00:00.000Z' })
    date!: string;

    @ApiProperty({ example: 'Dor lombar há 3 meses, com piora ao permanecer sentado' })
    chiefComplaint!: string;

    @ApiProperty({ example: 'Lombalgia mecânica crônica' })
    diagnosis!: string;

    @ApiProperty({ example: '10 sessões de cinesioterapia e fortalecimento do core, 2x por semana' })
    treatmentPlan!: string;

    @ApiProperty({ description: 'String vazia quando não informado', example: 'Paciente pratica corrida 3x por semana' })
    observations!: string;

    @ApiProperty({ format: 'date-time', example: '2026-10-29T14:30:00.000Z' })
    createdAt!: string;

    @ApiProperty({ type: MedicalRecordPatientDto })
    patient!: MedicalRecordPatientDto;
}
