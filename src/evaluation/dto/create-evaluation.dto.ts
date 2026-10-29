import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateEvaluationDto {

    @ApiProperty({ description: 'Nota da avaliação (número inteiro de 1 a 5)', type: 'integer', minimum: 1, maximum: 5, example: 5 })
    @IsInt({message: 'A nota deve ser um número inteiro'})
    @Min(1, {message: 'A nota mínima é 1'})
    @Max(5, {message: 'A nota máxima é 5'})
    @IsNotEmpty({message: 'A nota da avaliação é obrigatória'})
    rating!: number;

    @ApiPropertyOptional({ description: 'Comentário sobre o atendimento', example: 'Excelente profissional, muito atencioso!' })
    @IsOptional()
    @IsString()
    comment?: string;
}
