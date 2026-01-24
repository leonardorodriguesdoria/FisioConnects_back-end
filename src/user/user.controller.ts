import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerNewUser(@Body() userDto: CreateUserDto){
    await this.userService.createUser(userDto);
    return{message: "Usuário cadastrado com sucesso!.\n Um código para verificação de conta foi enviado para seu e-mail"}
  }
}
