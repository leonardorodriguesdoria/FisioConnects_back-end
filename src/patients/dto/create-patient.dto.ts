import {IsDateString, IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";


export class CreatePatientDto {

    @IsNotEmpty({message: "O campo nome não pode ser vazio"})
    @IsString({message: "Insira um nome válido"})
    name:string;

    @IsNotEmpty({message: "O campo data de nascimento não pode ser vazio"})
    @IsDateString()
    birthday: string;

    @IsNotEmpty({message: "O campo sexo não pode ser vazio"})
    @IsString({message: "Informe o sexo do paciente"})
    gender:string;

    @IsNotEmpty({message: "Insira o telefone do paciente"})
    @IsPhoneNumber()
    phone:string;

    @IsNotEmpty({message: "Insira o email do paciente"})
    @IsEmail({}, {message: "Insira um e-mail válido"})
    email:string;
}
