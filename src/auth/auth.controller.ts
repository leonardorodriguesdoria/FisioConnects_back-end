import { Controller, Post, Body, Get, UseGuards, Req, NotFoundException, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpTypes } from 'src/otp/types/otpType';
import { RequestTokenDTO } from 'src/auth/dto/request-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { Response } from 'express';
import { clearAuthCookie, setAuthCookie } from './auth-cookie';
import { Throttle } from '@nestjs/throttler';

const AUTH_THROTTLE = { default: { limit: 5, ttl: 60000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('logout')
  async logout(@Res({passthrough: true}) response: Response){
    clearAuthCookie(response);

    return {message: 'Sessão encerrada'}
  }

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

  @Throttle(AUTH_THROTTLE)
  @Post('reset-password')
  async resetPassword(
    @Body() {token, password}: ResetPasswordDto
  ){
    return this.authService.resetPassword(token, password)
  }

}
