import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, MaxLength } from "class-validator";
import { Transform } from 'class-transformer';

export class FilterUsersDTO {

    // Busca livre: cada palavra pode estar no nome, na cidade ou em alguma especialidade
    @ApiPropertyOptional({
        description: 'Busca livre. Cada palavra precisa aparecer no nome, na cidade ou em alguma especialidade do profissional',
        maxLength: 100,
        example: 'ortopedia são paulo',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    @ApiPropertyOptional({ description: 'Parte do nome do profissional', example: 'joão' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Especialidades desejadas. Retorna profissionais que atendem ao menos uma delas. Repita o parâmetro para enviar mais de uma: `?specialties=Ortopedia&specialties=Pilates`',
        type: [String],
        example: ['Ortopedia'],
    })
    @IsOptional()
    @IsArray()
    @IsString({each: true})
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    specialties?: string[];

    @ApiPropertyOptional({ description: 'Parte do nome da cidade', example: 'Campinas' })
    @IsOptional()
    @IsString()
    city?: string;
}
