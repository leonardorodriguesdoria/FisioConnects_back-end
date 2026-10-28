import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from "@nestjs/platform-express";
import { PatientService } from "./patient.service";
import { CreatePatientDto } from "src/patient/dto/create-patient.dto";

@Controller('patient')
export class PatintController {
    constructor(private readonly _patientService: PatientService){}

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('register')
    @UseInterceptors(FileInterceptor('image'))
    async registerNewPatient(
      @Body() userDto: CreatePatientDto,
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
    const emailSent = await this._patientService.createPatient(userDto, image);
    return{message: emailSent
      ? "Paciente cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"
      : "Paciente cadastrado com sucesso!.\n Não foi possível enviar o código de verificação agora. Use a opção de reenviar código ao fazer login"}
  }
}