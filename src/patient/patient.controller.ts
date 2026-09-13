import { Body, Controller, Post } from "@nestjs/common";
import { PatientService } from "./patient.service";
import { CreatePatientDto } from "src/patient/dto/create-patient.dto";

@Controller('patient')
export class PatintController {
    constructor(private readonly _patientService: PatientService){}

    @Post('register')
    async registerNewPatient(@Body() userDto: CreatePatientDto){
    await this._patientService.createPatient(userDto);
    return{message: "Paciente cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"}
  }
}