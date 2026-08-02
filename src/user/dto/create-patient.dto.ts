import { IsNotEmpty, IsEmail, IsStrongPassword } from "class-validator";

export class CreatePatientDto {

    @IsNotEmpty({ message: 'O campo de e-mail é obrigatório' })
    @IsEmail({}, { message: 'Por favor, insira um endereço de email válido' })
    email: string;

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
    password: string;
}