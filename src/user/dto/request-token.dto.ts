import { IsEmail, IsString } from "class-validator";

export class RequestTokenDTO {
    @IsEmail()
    @IsString()
    email: string;
}