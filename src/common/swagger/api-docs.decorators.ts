import { applyDecorators, Type } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCookieAuth,
    ApiInternalServerErrorResponse,
    ApiParam,
    ApiPropertyOptional,
    ApiSchema,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto, ValidationErrorResponseDto } from './api-responses.dto';

export const COOKIE_AUTH = 'cookie';
export const BEARER_AUTH = 'bearer';

/**Marca a rota como protegida pelo JwtAuthGuard (cookie `access_token` ou header Bearer) */
export function ApiAuth() {
    return applyDecorators(
        ApiCookieAuth(COOKIE_AUTH),
        ApiBearerAuth(BEARER_AUTH),
        ApiUnauthorizedResponse({
            description: 'Token ausente, inválido, expirado ou emitido antes da última troca de senha',
            type: ErrorResponseDto,
            example: { statusCode: 401, message: 'Token inválido ou expirou', error: 'Unauthorized' },
        }),
    );
}

/**Erro 400 gerado pelo ValidationPipe quando o corpo/query não respeita o DTO */
export function ApiValidationError() {
    return ApiBadRequestResponse({
        description: 'Dados inválidos: um ou mais campos não passaram na validação',
        type: ValidationErrorResponseDto,
    });
}

/**Rotas com limite de requisições mais restrito (5 por minuto) */
export function ApiStrictThrottle() {
    return ApiTooManyRequestsResponse({
        description: 'Limite de 5 requisições por minuto excedido para esta rota',
        type: ErrorResponseDto,
        example: { statusCode: 429, message: 'ThrottlerException: Too Many Requests' },
    });
}

export function ApiInternalError(message = 'Erro interno no sistema. Por favor, tente mais tarde') {
    return ApiInternalServerErrorResponse({
        description: 'Erro inesperado no servidor',
        type: ErrorResponseDto,
        example: { statusCode: 500, message, error: 'Internal Server Error' },
    });
}

/**
 * Documenta um corpo multipart/form-data com os campos do DTO + o arquivo opcional "image".
 * A classe gerada serve apenas para o Swagger: a validação continua sendo feita pelo DTO original.
 */
export function ApiImageUpload(dto: Type, schemaName: string, imageDescription: string) {
    @ApiSchema({ name: schemaName })
    class BodyWithImage extends dto {
        @ApiPropertyOptional({ type: 'string', format: 'binary', description: imageDescription })
        image?: unknown;
    }

    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiBody({
            type: BodyWithImage,
            description: 'Envie como `multipart/form-data`. O corpo também é aceito como `application/json` quando não há imagem.',
        }),
    );
}

/**Parâmetro de rota `publicId` (identificador público gerado com nanoid) */
export function ApiPublicIdParam(description: string) {
    return ApiParam({
        name: 'publicId',
        description,
        example: 'V1StGXR8_Z5jdHi6B-myT',
        type: String,
    });
}
