import { IsNotEmpty, IsString } from "class-validator";

export class CreateFavoriteDto {

    @IsString({message: 'O identificador do profissional deve ser um texto'})
    @IsNotEmpty({message: 'O identificador do profissional é obrigatório'})
    professionalPublicId!: string;
}
