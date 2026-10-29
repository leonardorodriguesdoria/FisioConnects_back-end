import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFavoriteDto {

    @ApiProperty({ description: 'publicId do profissional a ser favoritado', example: 'V1StGXR8_Z5jdHi6B-myT' })
    @IsString({message: 'O identificador do profissional deve ser um texto'})
    @IsNotEmpty({message: 'O identificador do profissional é obrigatório'})
    professionalPublicId!: string;
}
