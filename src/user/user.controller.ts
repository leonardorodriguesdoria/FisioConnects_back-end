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
import { ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfessionalPublicProfileDto } from 'src/professional/dto/professional-response.dto';
import { UpdateProfileResponseDto, UserProfileResponseDto } from './dto/user-response.dto';
import { ErrorResponseDto, MessageResponseDto } from 'src/common/swagger/api-responses.dto';
import { ApiAuth, ApiImageUpload, ApiInternalError, ApiValidationError } from 'src/common/swagger/api-docs.decorators';

@ApiTags('Usuário')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly authService: AuthService
  ) {}
  /*------------------------------------------------------------------------------------------- */
  /*ROTAS DE CRUD DE PERFIL DO USUÁRIOS */

  @ApiOperation({
    summary: 'Lista todos os profissionais (página inicial)',
    description: 'Rota pública. Retorna os profissionais cadastrados com a média e o total de avaliações.',
  })
  @ApiOkResponse({ description: 'Lista de profissionais', type: [ProfessionalPublicProfileDto] })
  @ApiNotFoundResponse({
    description: 'Nenhum profissional cadastrado',
    type: ErrorResponseDto,
    example: { statusCode: 404, message: 'Nenhum profissional encontrado em nossos registros', error: 'Not Found' },
  })
  @UseInterceptors(UserInterceptor)
  @Get('/home')
  async listUsers(){
    return await this.userService.getAllUsers()
  }

  @ApiOperation({
    summary: 'Retorna o perfil do usuário autenticado',
    description: 'Para profissionais, inclui os dados profissionais em `professional`; para pacientes, `professional` é `null`.',
  })
  @ApiAuth()
  @ApiOkResponse({ description: 'Perfil do usuário', type: UserProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } })
  @ApiInternalError()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get()
  async getUser(@Req() request){
    return this.userService.getOneUser(request.user.id);
  }

  @ApiOperation({
    summary: 'Atualiza o perfil do usuário autenticado',
    description:
      'Envie apenas os campos que deseja alterar. `phone`, `description`, `city` e `specialties` só se aplicam a profissionais ' +
      '(são ignorados para pacientes). Um novo cookie `access_token` é emitido com os dados atualizados.',
  })
  @ApiAuth()
  @ApiImageUpload(UpdateUserDto, 'UpdateUserWithImageDto', 'Nova foto de perfil (JPEG, PNG ou WebP, até 5 MB)')
  @ApiOkResponse({
    description: 'Perfil atualizado e novo cookie de sessão definido',
    type: UpdateProfileResponseDto,
    headers: { 'Set-Cookie': { description: 'access_token=<novo JWT>; HttpOnly; Path=/', schema: { type: 'string' } } },
  })
  @ApiValidationError()
  @ApiNotFoundResponse({ description: 'Usuário ou perfil profissional não encontrado', type: ErrorResponseDto, example: { statusCode: 404, message: 'Usuário não encontrado!!!!', error: 'Not Found' } })
  @ApiConflictResponse({
    description: 'E-mail ou telefone já está em uso por outro usuário',
    type: ErrorResponseDto,
    example: { statusCode: 409, message: 'Este e-mail já está sendo usado por outro usuário', error: 'Conflict' },
  })
  @ApiInternalError()
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

  @ApiOperation({
    summary: 'Exclui a conta do usuário autenticado',
    description: 'Remove definitivamente a conta e, em cascata, o perfil profissional, pacientes clínicos, prontuários, avaliações e favoritos vinculados.',
  })
  @ApiAuth()
  @ApiOkResponse({ description: 'Conta excluída', type: MessageResponseDto, example: { message: 'Conta excluída com sucesso!!!' } })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado', type: ErrorResponseDto })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteProfile(@Req() request){
    await this.userService.deleteUser(request.user.id);
    return{message: 'Conta excluída com sucesso!!!'}
  }
}
