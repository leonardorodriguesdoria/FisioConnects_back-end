import { Controller, Post, Body, Get, UseGuards, Req, NotFoundException, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpTypes } from 'src/otp/types/otpType';
import { RequestTokenDTO } from 'src/auth/dto/request-token.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async create(
    @Body() loginUserDto: LoginUserDto,
    @Res({passthrough: true}) response: Response
  ) {
    const result = await this.authService.userLogin(loginUserDto);

    if(!('access_token' in result)){
      return result
    }

    response.cookie('access_token', result.access_token,{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    const {access_token, ...userData} = result;

    return userData;
  }

  @Post('request-otp')
    async requestOtp(@Body() requestTokenDto: RequestTokenDTO){
    const {email} = requestTokenDto;
    const user = await this.authService.findByEmail(email)
    if(!user){
        throw new NotFoundException("Usuário não encontrado");
    }
    //Se o usuário existe, o código é enviado novamente para seu e-mail
    await this.authService.emailVerification(user, OtpTypes.OTP);
    return {message: "Um novo código de verificação foi enviado para seu e-mail"}
  }
    
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

  @Post('reset-password')
  async resetPassword(
    @Body() {token, password}: {token: string; password: string}
  ){
    return this.authService.resetPassword(token, password)
  }

}
