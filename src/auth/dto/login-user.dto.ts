/* eslint-disable prettier/prettier */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'E-mail cadastrado', example: 'maria.silva@email.com' })
  @IsEmail({}, { message: 'Por favor insira um endereço de e-mail válido!!!' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Senha da conta', minLength: 6, example: 'Senha@123' })
  @IsString()
  @MinLength(6, { message: 'Senha de login deve ter no minímo 6 caracteres' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Código de verificação de 6 dígitos enviado por e-mail. Obrigatório apenas enquanto a conta não estiver verificada',
    example: '482913',
  })
  @IsOptional()
  @IsString()
  otp?: string;
}
