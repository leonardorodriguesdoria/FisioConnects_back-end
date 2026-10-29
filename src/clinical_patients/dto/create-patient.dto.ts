import { ApiHideProperty, ApiProperty, ApiSchema } from "@nestjs/swagger";
import {IsDateString, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";


//Nome próprio no Swagger para não colidir com o CreatePatientDto do cadastro de usuários
@ApiSchema({ name: 'CreateClinicalPatientDto' })
export class CreatePatientDto {

    @ApiProperty({ description: 'Nome completo do paciente', example: 'Carlos Oliveira' })
    @IsNotEmpty({message: "O campo nome não pode ser vazio"})
    @IsString({message: "Insira um nome válido"})
    name:string;

    @ApiProperty({ description: 'Data de nascimento (ISO 8601)', format: 'date', example: '1988-04-15' })
    @IsNotEmpty({message: "O campo data de nascimento não pode ser vazio"})
    @IsDateString()
    birthday: string;

    @ApiProperty({ description: 'Sexo do paciente', example: 'Masculino' })
    @IsNotEmpty({message: "O campo sexo não pode ser vazio"})
    @IsString({message: "Informe o sexo do paciente"})
    gender:string;

    @ApiProperty({ description: 'Telefone em formato internacional (E.164)', example: '+5511977776666' })
    @IsNotEmpty({message: "Insira o telefone do paciente"})
    @IsPhoneNumber()
    phone:string;

    @ApiProperty({ description: 'E-mail do paciente (único entre os pacientes do profissional)', example: 'carlos.oliveira@email.com' })
    @IsNotEmpty({message: "Insira o email do paciente"})
    @IsEmail({}, {message: "Insira um e-mail válido"})
    email:string;

    @ApiProperty({ description: 'Endereço completo', example: 'Rua das Flores, 123 - Centro, São Paulo/SP' })
    @IsNotEmpty({message: "O campo endereço não pode ser vazio"})
    @IsString({message: "Insira um endereço válido"})
    address: string;

    @ApiProperty({ description: 'Profissão do paciente', example: 'Engenheiro' })
    @IsNotEmpty({message: "O campo da profissão não pode ser vazio"})
    @IsString({message: "Insira um nome de profissão válido"})
    profession: string;

    @ApiProperty({ description: 'Nacionalidade do paciente', example: 'Brasileira' })
    @IsNotEmpty({message: "Informe a nacionalidade do paciente"})
    @IsString({message: "Insira um nome de nacionalidade válida"})
    nationality: string;

    @ApiHideProperty()
    @IsOptional()
    picture?: string;
}
