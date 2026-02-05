import { IsOptional, IsString, MaxLength, IsEmail, Matches, IsArray } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Número de telefone inválido. Use um formato como +5511999999999',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    specialties?: string[];
}