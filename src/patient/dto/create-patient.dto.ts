import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail, IsStrongPassword, IsString } from "class-validator";

export class CreatePatientDto {
    @ApiProperty({ description: 'Nome completo do paciente', example: 'Maria Silva' })
    @IsString({message: 'Insira um nome válido'})
    @IsNotEmpty({ message: 'O campo de nome é obrigatório' })
    name!:string;

    @ApiProperty({ description: 'E-mail de acesso (único na plataforma)', example: 'maria.silva@email.com' })
    @IsNotEmpty({ message: 'O campo de e-mail é obrigatório' })
    @IsEmail({}, { message: 'Por favor, insira um endereço de email válido' })
    email!: string;

    @ApiProperty({
        description: 'Senha: mínimo de 6 caracteres, com ao menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial',
        example: 'Senha@123',
    })
    @IsNotEmpty({ message: 'O campo de senha é obrigatório' })
    @IsStrongPassword(
        {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
        },
        {
            message:
            'A senha deve ter no minímo 6 caracteres, incluindo: 1 letra maiúscula, 1 letra minúscula, e 1 caractere especial',
        },
    )
    password!: string;
}
