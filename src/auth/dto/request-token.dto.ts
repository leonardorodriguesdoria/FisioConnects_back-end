import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class RequestTokenDTO {
    @ApiProperty({ description: 'E-mail da conta cadastrada', example: 'maria.silva@email.com' })
    @IsEmail()
    @IsString()
    email!: string;
}
