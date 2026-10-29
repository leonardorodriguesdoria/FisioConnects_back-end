import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateEvolutionDto {

    @ApiProperty({
        description: 'Descrição da evolução do quadro do paciente nesta sessão',
        example: 'Paciente relata redução da dor lombar. Ganho de 10° de amplitude na flexão do tronco.',
    })
    @IsString()
    @IsNotEmpty({message: 'A descrição da evolução é obrigatória'})
    description!: string;
}
