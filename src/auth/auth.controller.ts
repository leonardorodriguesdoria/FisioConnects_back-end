import { Controller, Post, Body, Get, UseGuards, Req} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async create(@Body() loginUserDto: LoginUserDto) {
    return this.authService.userLogin(loginUserDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() {token, password}: {token: string; password: string}
  ){
    return this.authService.resetPassword(token, password)
  }

}
