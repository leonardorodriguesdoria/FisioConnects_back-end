import { ApiHideProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class UpdatePatientDto {
    @ApiPropertyOptional({ description: 'Nome completo do paciente', example: 'Carlos Oliveira Santos' })
    @IsOptional()
    @IsString({message: "Insira um nome válido"})
    name?: string;

    @ApiPropertyOptional({ description: 'Data de nascimento (ISO 8601)', format: 'date', example: '1988-04-15' })
    @IsOptional()
    @IsDateString()
    birthday?: string;

    @ApiPropertyOptional({ description: 'Sexo do paciente', example: 'Masculino' })
    @IsOptional()
    @IsString()
    gender?:string;

    @ApiPropertyOptional({ description: 'Telefone em formato internacional (E.164)', example: '+5511977776666' })
    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @ApiPropertyOptional({ description: 'E-mail (único entre os pacientes do profissional)', example: 'carlos.santos@email.com' })
    @IsOptional()
    @IsEmail({}, {message: "Por favor, insira um endereço de e-mail válido"})
    email?:string;

    @ApiPropertyOptional({ description: 'Endereço completo', example: 'Av. Brasil, 500 - Jardim América, São Paulo/SP' })
    @IsOptional()
    @IsString({message: "Insira um endereço válido"})
    address?: string;

    @ApiPropertyOptional({ description: 'Profissão do paciente', example: 'Professor' })
    @IsOptional()
    @IsString({message: "Insira um nome profissão válido"})
    profession?: string;

    @ApiPropertyOptional({ description: 'Nacionalidade do paciente', example: 'Brasileira' })
    @IsOptional()
    @IsString({message: "Insira uma nacionalidade válida"})
    nationality?: string;

    //Preenchido pelo controller a partir do arquivo enviado no campo "image"
    @ApiHideProperty()
    @IsOptional()
    picture?: string;
}
