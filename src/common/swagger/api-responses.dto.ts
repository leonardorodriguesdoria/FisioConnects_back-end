import { ApiProperty } from '@nestjs/swagger';

/**Resposta padrão das rotas que retornam apenas uma mensagem de confirmação */
export class MessageResponseDto {
    @ApiProperty({ description: 'Mensagem de retorno da operação', example: 'Operação realizada com sucesso' })
    message!: string;
}

/**Formato padrão de erro devolvido pelo NestJS (HttpException) */
export class ErrorResponseDto {
    @ApiProperty({ description: 'Código HTTP do erro', example: 404 })
    statusCode!: number;

    @ApiProperty({ description: 'Mensagem explicando o erro', example: 'Usuário não encontrado' })
    message!: string;

    @ApiProperty({ description: 'Nome do erro HTTP', example: 'Not Found' })
    error!: string;
}

/**Erro de validação do ValidationPipe: uma mensagem para cada campo inválido */
export class ValidationErrorResponseDto {
    @ApiProperty({ description: 'Código HTTP do erro', example: 400 })
    statusCode!: number;

    @ApiProperty({
        description: 'Lista com as mensagens de validação de cada campo inválido',
        type: [String],
        example: ['Por favor insira um endereço de e-mail válido!!!', 'property foo should not exist'],
    })
    message!: string[];

    @ApiProperty({ description: 'Nome do erro HTTP', example: 'Bad Request' })
    error!: string;
}
