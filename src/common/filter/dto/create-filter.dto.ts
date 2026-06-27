import { IsArray, IsOptional, IsString } from "class-validator";
import { Transform } from 'class-transformer';

export class FilterUsersDTO {

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
