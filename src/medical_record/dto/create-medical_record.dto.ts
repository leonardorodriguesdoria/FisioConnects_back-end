import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsDateString, IsString, IsOptional } from "class-validator";

export class CreateMedicalRecordDto {

    @ApiProperty({ description: 'Data do atendimento/registro do prontuário (ISO 8601)', format: 'date', example: '2026-10-29' })
    @IsNotEmpty({message: "A data de registro do prontuário é obrigatória"})
    @IsDateString()
    date!: string;

    @ApiProperty({
        description: 'Queixa principal do paciente. Atenção: no corpo da requisição o campo se chama `chiefComplain`; nas respostas ele é devolvido como `chiefComplaint`',
        example: 'Dor lombar há 3 meses, com piora ao permanecer sentado',
    })
    @IsNotEmpty({message: "O campo de queixa principal do paciente é obrigatório"})
    @IsString({message: "Informe uma queixa válida do paciente"})
    chiefComplain!: string;

    @ApiProperty({ description: 'Diagnóstico fisioterapêutico', example: 'Lombalgia mecânica crônica' })
    @IsNotEmpty({message: "O campo de diagnose do paciente é obrigatório"})
    @IsString({message: "Registre uma diagnose válida para o quadro do paciente"})
    diagnosis!: string;

    @ApiProperty({ description: 'Plano de tratamento proposto', example: '10 sessões de cinesioterapia e fortalecimento do core, 2x por semana' })
    @IsNotEmpty({message: "O campo de plano de tratamento do paciente é obrigatório"})
    @IsString({message: "Registre um plano de tratamento válido para o quadro do paciente"})
    treatmentPlan!: string;

    @ApiPropertyOptional({ description: 'Observações adicionais', example: 'Paciente pratica corrida 3x por semana' })
    @IsOptional()
    @IsString({message: "Registre observações válidas"})
    observations?: string;
}
