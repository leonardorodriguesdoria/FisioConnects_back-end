import { ApiHideProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, IsEmail, Matches, IsArray } from "class-validator";

export class UpdateUserDto {
    @ApiPropertyOptional({ description: 'Novo nome', maxLength: 50, example: 'Maria Silva Souza' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    name?: string;

    @ApiPropertyOptional({ description: 'Novo e-mail (não pode estar em uso por outro usuário)', example: 'maria.souza@email.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: '[Apenas profissionais] Telefone em formato E.164', example: '+5511988887777' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Número de telefone inválido. Use um formato como +5511999999999',
    })
    phone?: string;

    @ApiPropertyOptional({ description: '[Apenas profissionais] Apresentação do perfil', maxLength: 500, example: 'Especialista em reabilitação pós-cirúrgica.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ description: '[Apenas profissionais] Cidade de atendimento', maxLength: 50, example: 'Campinas' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    city?:string;

    //A foto é enviada como arquivo no campo "image" (multipart), não por este campo
    @ApiHideProperty()
    @IsOptional()
    @IsString()
    profilePicture?: string;

    @ApiPropertyOptional({ description: '[Apenas profissionais] Especialidades atendidas', type: [String], example: ['Ortopedia', 'Pilates'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    specialties?: string[];
}
