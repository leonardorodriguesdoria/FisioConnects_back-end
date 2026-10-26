import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';

@Controller('professional')
export class ProfessionalController {
  constructor(private readonly _professionalService: ProfessionalService){}

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
      await this._professionalService.createProfessional(createProfessionalDto, image);
      return{message: "Profissional cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"}
    }

  @Get(':publicId')
    async getProfessional(@Param('publicId') publicId: string){
      return this._professionalService.getProfessionalByPublicId(publicId);
    }
}
