import { Controller, Post, Body, Get, UseGuards, Req, NotFoundException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpTypes } from 'src/otp/types/otpType';
import { RequestTokenDTO } from 'src/auth/dto/request-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async create(@Body() loginUserDto: LoginUserDto) {
    return this.authService.userLogin(loginUserDto);
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
