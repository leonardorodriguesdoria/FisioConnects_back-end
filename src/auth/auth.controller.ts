import { Controller, Post, Body, Get, UseGuards, Req, NotFoundException, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpTypes } from 'src/otp/types/otpType';
import { RequestTokenDTO } from 'src/auth/dto/request-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { Response } from 'express';
import { clearAuthCookie, setAuthCookie } from './auth-cookie';
import { Throttle } from '@nestjs/throttler';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiExtraModels, ApiNotFoundResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import { AuthenticatedUserDto, PendingVerificationResponseDto } from './dto/auth-response.dto';
import { ErrorResponseDto, MessageResponseDto } from 'src/common/swagger/api-responses.dto';
import { ApiInternalError, ApiStrictThrottle, ApiValidationError } from 'src/common/swagger/api-docs.decorators';

const AUTH_THROTTLE = { default: { limit: 5, ttl: 60000 } };

@ApiTags('Autenticação')
@ApiExtraModels(AuthenticatedUserDto, PendingVerificationResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Realiza o login',
    description:
      'Valida as credenciais e grava o JWT (válido por 3 dias) no cookie httpOnly `access_token`. ' +
      'O token não é devolvido no corpo da resposta.\n\n' +
      '**Contas não verificadas:** se a conta ainda não foi verificada e o campo `otp` não for enviado, ' +
      'a API responde apenas com uma mensagem (sem cookie). Envie novamente com o `otp` recebido por e-mail ' +
      'para verificar a conta e entrar. Para receber um novo código, use `POST /auth/request-otp`.',
  })
  @ApiCreatedResponse({
    description: 'Login realizado (cookie `access_token` definido) **ou** conta pendente de verificação',
    headers: {
      'Set-Cookie': {
        description: 'access_token=<JWT>; HttpOnly; Path=/; Max-Age=259200 (enviado apenas quando o login é concluído)',
        schema: { type: 'string' },
      },
    },
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AuthenticatedUserDto) },
        { $ref: getSchemaPath(PendingVerificationResponseDto) },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou código de verificação (OTP) inválido/expirado',
    type: ErrorResponseDto,
    example: { statusCode: 400, message: 'Código de verificação expirou. Por favor, solicite um novo', error: 'Bad Request' },
  })
  @ApiUnauthorizedResponse({
    description: 'Senha incorreta',
    type: ErrorResponseDto,
    example: { statusCode: 401, message: 'Senha incorreta', error: 'Unauthorized' },
  })
  @ApiNotFoundResponse({
    description: 'Nenhum usuário com o e-mail informado',
    type: ErrorResponseDto,
    example: { statusCode: 404, message: 'Usuário não encontrado. Por favor verifique os dados inseridos', error: 'Not Found' },
  })
  @ApiStrictThrottle()
  @ApiInternalError()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  async create(
    @Body() loginUserDto: LoginUserDto,
    @Res({passthrough: true}) response: Response
  ) {
    const result = await this.authService.userLogin(loginUserDto);

    if(!('access_token' in result)){
      return result
    }

    setAuthCookie(response, result.access_token);

    const {access_token, ...userData} = result;

    return userData;
  }

  @ApiOperation({
    summary: 'Encerra a sessão',
    description: 'Remove o cookie `access_token` do navegador. Não exige autenticação.',
  })
  @ApiCreatedResponse({ description: 'Cookie de sessão removido', type: MessageResponseDto, example: { message: 'Sessão encerrada' } })
  @Post('logout')
  async logout(@Res({passthrough: true}) response: Response){
    clearAuthCookie(response);

    return {message: 'Sessão encerrada'}
  }

  @ApiOperation({
    summary: 'Reenvia o código de verificação de conta',
    description: 'Gera um novo código de 6 dígitos (válido por 5 minutos) e o envia para o e-mail informado. O código anterior deixa de valer.',
  })
  @ApiCreatedResponse({
    description: 'Código enviado por e-mail',
    type: MessageResponseDto,
    example: { message: 'Um novo código de verificação foi enviado para seu e-mail' },
  })
  @ApiValidationError()
  @ApiNotFoundResponse({ description: 'E-mail não cadastrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } })
  @ApiServiceUnavailableResponse({
    description: 'Falha no serviço de e-mail',
    type: ErrorResponseDto,
    example: { statusCode: 503, message: 'Não foi possível enviar o e-mail no momento. Tente novamente em alguns minutos', error: 'Service Unavailable' },
  })
  @ApiStrictThrottle()
  @Throttle(AUTH_THROTTLE)
  @Post('request-otp')
    async requestOtp(@Body() requestTokenDto: RequestTokenDTO){
    const {email} = requestTokenDto;
    const user = await this.authService.findByEmail(email)
    if(!user){
        throw new NotFoundException("Usuário não encontrado");
    }
    await this.authService.emailVerification(user, OtpTypes.OTP);
    return {message: "Um novo código de verificação foi enviado para seu e-mail"}
  }
    
  @ApiOperation({
    summary: 'Solicita a redefinição de senha',
    description:
      'Envia para o e-mail informado um link de redefinição no formato `RESET_PASSWORD_URL?token=<token>`. ' +
      'O token é válido por 15 minutos e deve ser enviado em `POST /auth/reset-password`.',
  })
  @ApiCreatedResponse({
    description: 'Link de redefinição enviado por e-mail',
    type: MessageResponseDto,
    example: { message: 'Um link de redefinição de senha foi enviado. Por favor, verifique seu e-mail' },
  })
  @ApiValidationError()
  @ApiNotFoundResponse({ description: 'E-mail não cadastrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } })
  @ApiServiceUnavailableResponse({
    description: 'Falha no serviço de e-mail',
    type: ErrorResponseDto,
    example: { statusCode: 503, message: 'Não foi possível enviar o e-mail no momento. Tente novamente em alguns minutos', error: 'Service Unavailable' },
  })
  @ApiStrictThrottle()
  @Throttle(AUTH_THROTTLE)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: RequestTokenDTO){
  const {email} = forgotDto;
  const user = await this.authService.findByEmail(email)
    if(!user){
        throw new NotFoundException("Usuário não encontrado");
    }

    await this.authService.emailVerification(user, OtpTypes.RESET_LINK);
    return {message: `Um link de redefinição de senha foi enviado. Por favor, verifique seu e-mail`}
  }

  @ApiOperation({
    summary: 'Redefine a senha',
    description:
      'Define uma nova senha usando o token recebido por e-mail. O token é de uso único: depois da troca, ' +
      'ele e todas as sessões abertas anteriormente deixam de ser válidos.',
  })
  @ApiCreatedResponse({
    description: 'Senha redefinida (a resposta é um texto simples)',
    content: { 'text/html': { schema: { type: 'string', example: 'Senha redefinida com sucesso!!!' } } },
  })
  @ApiBadRequestResponse({
    description: 'Senha fora do padrão, token inválido/expirado/já utilizado ou usuário inexistente',
    type: ErrorResponseDto,
    example: { statusCode: 400, message: 'Token inválido. Por favor solicite um novo e-mail de redefinição', error: 'Bad Request' },
  })
  @ApiStrictThrottle()
  @Throttle(AUTH_THROTTLE)
  @Post('reset-password')
  async resetPassword(
    @Body() {token, password}: ResetPasswordDto
  ){
    return this.authService.resetPassword(token, password)
  }

}
