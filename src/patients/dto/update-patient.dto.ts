import { IsDateString, IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class UpdatePatientDto {
    @IsOptional()
    @IsString({message: "Insira um nome válido"})
    name?: string;

    @IsOptional()
    @IsDateString()
    birthday?: string;

    @IsOptional()
    @IsString()
    gender?:string;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @IsOptional()
    @IsEmail({}, {message: "Por favor, insira um endereço de e-mail válido"})
    email?:string;

    @IsOptional()
    @IsString({message: "Insira um endereço válido"})
    address?: string;

    @IsOptional()
    @IsString({message: "Insira um nome profissão válido"})
    profession?: string;

    @IsOptional()
    @IsString({message: "Insira uma nacionalidade válida"})
    nationality?: string;

    @IsOptional()
    picture?: string;
}