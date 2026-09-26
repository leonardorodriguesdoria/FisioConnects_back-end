import { IsNotEmpty, IsString } from "class-validator";


export class CreateEvolutionDto {

    @IsString()
    @IsNotEmpty({message: 'A descrição da evolução é obrigatória'})
    description!: string;
}