import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Token recebido no link de redefinição enviado por e-mail (parâmetro `token` da URL). Válido por 15 minutos e de uso único',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    @IsNotEmpty({ message: 'Token de redefinição não informado' })
    token!: string;

    @ApiProperty({
        description: 'Nova senha: mínimo de 6 caracteres, com ao menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial',
        example: 'NovaSenha@123',
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
            message: 'A senha deve ter no minímo 6 caracteres, incluindo: 1 letra maiúscula, 1 letra minúscula, e 1 caractere especial',
        }
    )
    password!: string;
}
