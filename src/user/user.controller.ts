import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, ParseIntPipe, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestTokenDTO } from './dto/request-token.dto';
import { OtpTypes } from 'src/otp/types/otpType';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerNewUser(@Body() userDto: CreateUserDto){
    await this.userService.createUser(userDto);
    return{message: "Usuário cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"}
  }

  @Post('request-otp')
  async requestOtp(@Body() requestTokenDto: RequestTokenDTO){
    const {email} = requestTokenDto;
    const user = await this.userService.findByEmail(email)
    if(!user){
      throw new NotFoundException("Usuário não encontrado");
    }
    //Se o usuário existe, o código é enviado novamente para seu e-mail
    await this.userService.emailVerification(user, OtpTypes.OTP);
    return {message: "Um novo código de verificação foi enviado para seu e-mail"}
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: RequestTokenDTO){
    const {email} = forgotDto;
    const user = await this.userService.findByEmail(email)
    if(!user){
      throw new NotFoundException("Usuário não encontrado");
    }

    await this.userService.emailVerification(user, OtpTypes.RESET_LINK);
    return {message: `Um link de redefinição de senha foi enviado. Por favor, verifique seu e-mail`}
  }

  /*------------------------------------------------------------------------------------------- */
  /*ROTAS DE CRUD DE PERFIL DO USUÁRIOS */

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number){
    return this.userService.getOneUser(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Body() uptateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number
  ){
    if (image) {
      uptateUserDto.profilePicture = image.path
    }
    const updateProfile = await this.userService.updateUser(
      id,
      uptateUserDto
    );

    return {
      message: 'Dados do perfil atualizados com sucesso!!!',
      updateProfile,
    };
  }
}
