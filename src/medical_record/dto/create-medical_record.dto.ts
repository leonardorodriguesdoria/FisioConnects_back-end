import { IsNotEmpty, IsDateString, IsString, IsOptional } from "class-validator";

export class CreateMedicalRecordDto {

    @IsNotEmpty({message: "A data de registro do prontuário é obrigatória"})
    @IsDateString()
    date!: string;

    @IsNotEmpty({message: "O campo de queixa principal do paciente é obrigatório"})
    @IsString({message: "Informe uma queixa válida do paciente"})
    chiefComplain!: string;

    @IsNotEmpty({message: "O campo de diagnose do paciente é obrigatório"})
    @IsString({message: "Registre uma diagnose válida para o quadro do paciente"})
    diagnosis!: string;

    @IsNotEmpty({message: "O campo de plano de tratamento do paciente é obrigatório"})
    @IsString({message: "Registre um plano de tratamento válido para o quadro do paciente"})
    treatmentPlan!: string;

    @IsOptional()
    @IsString({message: "Registre observações válidas"})
    observations?: string;
}
