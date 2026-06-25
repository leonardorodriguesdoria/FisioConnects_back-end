import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMedicalRecordDto {
    @IsNotEmpty({ message: 'O campo de diagnóstico é obrigatório' })
    @IsString({ message: 'O diagnóstico deve ser um texto válido' })
    diagnosis: string;

    @IsOptional()
    @IsString({ message: 'O plano de tratamento deve ser um texto válido' })
    plan?: string;

    @IsOptional()
    @IsString({ message: 'As observações devem ser um texto válido' })
    observations?: string;
}
