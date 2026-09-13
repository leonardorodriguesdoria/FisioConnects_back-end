import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';

@Controller('professional')
export class ProfessionalController {
  constructor(private readonly _professionalService: ProfessionalService){}

  @Post('register')
    async registerNewProfessional(@Body() createProfessionalDto: CreateProfessionalDto){
      await this._professionalService.createProfessional(createProfessionalDto);
      return{message: "Profissional cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"}
    }
}
