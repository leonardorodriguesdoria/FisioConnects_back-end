import { Controller, Get, Post, Body, Patch, Delete, UseGuards, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserInterceptor } from 'src/common/interceptors/interceptor';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  /*------------------------------------------------------------------------------------------- */
  /*ROTAS DE CRUD DE PERFIL DO USUÁRIOS */

  @UseInterceptors(UserInterceptor)
  @Get('/home')
  async listUsers(){
    return await this.userService.getAllUsers()
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get()
  async getUser(@Req() request){
    return this.userService.getOneUser(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  @UseInterceptors(FileInterceptor('image'), UserInterceptor)
  async updateProfile(
    @Body() uptateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() request,
  ){
    if (image) {
      uptateUserDto.profilePicture = image.path
    }
    
    await this.userService.updateUser(request.user.id,uptateUserDto);

    return {
      message: 'Dados do perfil atualizados com sucesso!!!',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteProfile(@Req() request){
    await this.userService.deleteUser(request.user.id);
    return{message: 'Conta deleteda com sucesso!!!'}
  }
}
