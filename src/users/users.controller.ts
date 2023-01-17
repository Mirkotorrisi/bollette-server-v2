import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Response,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UsersService } from './users.service';
import { Response as Res } from 'express';
import { LoginDto } from './dto/LogIn.dto';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { LogoutDto } from './dto/Logout.dto';

@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/register')
  async createUser(@Body() createUserDto: CreateUserDto, @Response() res: Res) {
    const { user, token } = await this.authService.register(createUserDto);
    return res
      .set({
        'Access-Control-Expose-Headers': 'x-auth-token',
        'x-auth-token': token,
      })
      .json(user);
  }

  @Post('/login')
  async loginUser(@Body() loginDto: LoginDto, @Response() res: Res) {
    const { user, token } = await this.authService.login(loginDto);
    return res
      .set({
        'Access-Control-Expose-Headers': 'x-auth-token',
        'x-auth-token': token,
      })
      .json(user);
  }

  @Post('/logout')
  async logoutUser(@Body() logoutDto: LogoutDto) {
    return await this.authService.logout(logoutDto);
  }

  @UseInterceptors(AuthInterceptor)
  @Get('/account_sum/:userId')
  async getAccountSum(@Param('userId') userId: string) {
    return await this.usersService.getAccountSum(userId);
  }

  @UseInterceptors(AuthInterceptor)
  @Get('/tickets/:userId')
  async getUserTickets(@Param('userId') userId: string) {
    return await this.usersService.getUserTickets(userId);
  }

  @Get()
  getAll() {
    return this.usersService.findAll();
  }
}
