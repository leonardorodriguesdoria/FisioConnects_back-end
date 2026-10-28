import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';

@Controller('professional')
export class ProfessionalController {
  constructor(private readonly _professionalService: ProfessionalService){}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
    async registerNewProfessional(
      @Body() createProfessionalDto: CreateProfessionalDto,
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
      image?: Express.Multer.File,
    ){
      const emailSent = await this._professionalService.createProfessional(createProfessionalDto, image);
      return{message: emailSent
        ? "Profissional cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"
        : "Profissional cadastrado com sucesso!.\n Não foi possível enviar o código de verificação agora. Use a opção de reenviar código ao fazer login"}
    }

  @Get(':publicId')
    async getProfessional(@Param('publicId') publicId: string){
      return this._professionalService.getProfessionalByPublicId(publicId);
    }
}
