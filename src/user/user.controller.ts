import { Controller, Get, Post, Body, Patch, Delete, UseGuards, UploadedFile, UseInterceptors, Req, Res, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { setAuthCookie } from 'src/auth/auth-cookie';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserInterceptor } from 'src/common/interceptors/interceptor';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly authService: AuthService
  ) {}
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
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          })
        ]
      })
    ) 
    image: Express.Multer.File,
    @Req() request,
    @Res({passthrough: true}) response: Response,
  ){
    const uploadedImage = image
    ? await this.cloudinaryService.uploadProfilePicture(image)
    : undefined;

    const {user} = await this.userService.updateUser(request.user.id, uptateUserDto, uploadedImage);

    //Gera um novo token para que nome, e-mail e foto do token reflitam os dados atualizados
    const {access_token, ...userData} = this.authService.createToken(user);
    setAuthCookie(response, access_token);

    return {message: 'Dados do perfil atualizados com sucesso!', user: userData}
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteProfile(@Req() request){
    await this.userService.deleteUser(request.user.id);
    return{message: 'Conta excluída com sucesso!!!'}
  }
}
