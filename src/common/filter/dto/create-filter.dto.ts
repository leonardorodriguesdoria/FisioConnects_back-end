import { IsArray, IsOptional, IsString, MaxLength } from "class-validator";
import { Transform } from 'class-transformer';

export class FilterUsersDTO {

    // Busca livre: cada palavra pode estar no nome, na cidade ou em alguma especialidade
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    specialties?: string[];

    @IsOptional()
    @IsString()
    city?: string;
}
