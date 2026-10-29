import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail, IsPhoneNumber, IsStrongPassword, Validate, IsOptional, IsArray, ArrayNotEmpty } from "class-validator";

export class CreateProfessionalDto {

    @ApiProperty({ description: 'Nome completo do profissional', minLength: 3, maxLength: 50, example: 'Dr. João Pereira' })
    @IsNotEmpty({ message: 'O campo de nome é obrigatório' })
    @IsString({ message: 'Por favor, insira um nome válido' })
    @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres' })
    name!: string;

    @ApiProperty({ description: 'E-mail de acesso (único na plataforma)', maxLength: 100, example: 'joao.pereira@email.com' })
    @IsNotEmpty({ message: 'O campo de e-mail é obrigatório' })
    @IsEmail({}, { message: 'Por favor, insira um endereço de email válido' })
    @MaxLength(100, { message: 'O e-mail deve ter no máximo 100 caracteres' })
    email!: string;
    
    @ApiProperty({ description: 'Telefone em formato internacional (E.164). Único entre os profissionais', example: '+5511999999999' })
    @IsNotEmpty({ message: 'O campo de telefone é obrigatório' })
    @IsPhoneNumber()
    phone!: string;

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
            message: 'A senha deve ter no minímo 6 caracteres, incluindo: 1 letra maiúscula, 1 letra minúscula, e 1 caractere especial',
        }
    )
    password!: string;

    @ApiProperty({ description: 'Cidade de atendimento', example: 'São Paulo' })
    @IsString()
    @IsNotEmpty()
    city!: string;

    //A foto é enviada como arquivo no campo "image" (multipart), não por este campo
    @ApiHideProperty()
    @IsOptional()
    profilePicture?: string;

    @ApiProperty({
        description: 'Especialidades atendidas (ao menos uma)',
        type: [String],
        example: ['Ortopedia', 'Fisioterapia esportiva'],
    })
    @IsArray()
    @ArrayNotEmpty()
    specialties!: string[];

    @ApiProperty({ description: 'Apresentação exibida no perfil público', example: 'Fisioterapeuta com 10 anos de experiência em reabilitação esportiva.' })
    @IsString()
    @IsNotEmpty()
    description!: string;
}
