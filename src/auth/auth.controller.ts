import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialDto } from './dto/auth.credential.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,) {}

  @Post('auth/login')
  async login(@Body() authCredentialDto: AuthCredentialDto):  Promise<any> {
   

    return await this.authService.login(authCredentialDto);;
  }

}
