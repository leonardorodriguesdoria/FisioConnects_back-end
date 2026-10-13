import { Controller, Get, Post, Body, Patch, Delete, UseGuards, UploadedFile, UseInterceptors, Req, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
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
    private readonly cloudinaryService: CloudinaryService
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
  ){
    const uploadedImage = image 
    ? await this.cloudinaryService.uploadProfilePicture(image)
    : undefined;

    await this.userService.updateUser(request.user.id, uptateUserDto, uploadedImage);

    return {message: 'Dados do perfil atualizados com sucesso! '}
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteProfile(@Req() request){
    await this.userService.deleteUser(request.user.id);
    return{message: 'Conta deleteda com sucesso!!!'}
  }
}
