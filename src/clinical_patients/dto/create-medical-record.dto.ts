import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMedicalRecordDto {

    @IsNotEmpty({message: "Informe a data de registro do prontuário"})
    @IsDateString()
    date: string;

    @IsNotEmpty({message: "Informe a principal queixa do paciente"})
    @IsString({message: "Insira um texto válido"})
    chiefComplain: string;

    @IsNotEmpty({message: "Informe o plano de saúde do paciente"})
    @IsString({message: "Insira um texto válido"})
    treatmentPlan: string;

    @IsNotEmpty({ message: 'O campo de diagnóstico é obrigatório' })
    @IsString({ message: 'O diagnóstico deve ser um texto válido' })
    diagnosis: string;

    @IsOptional()
    observations?: string;
}
