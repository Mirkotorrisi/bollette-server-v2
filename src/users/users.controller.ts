import {
  Body,
  Controller,
  Get,
  Post,
  Request,
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
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('USERS')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/register')
  @ApiOperation({
    summary: 'Register user, needs email, username and password',
  })
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
  @ApiOperation({
    summary:
      'Login user throught email/username and password and stores token on redis',
  })
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
  @ApiOperation({
    summary: 'Log out user',
  })
  async logoutUser(@Body() logoutDto: LogoutDto) {
    return await this.authService.logout(logoutDto);
  }

  @UseInterceptors(AuthInterceptor)
  @Get('/account_sum')
  @ApiHeader({
    name: 'x-auth-token',
  })
  @ApiOperation({
    summary: 'Needs auth, returns user balance',
  })
  async getUserInfo(@Request() req: any) {
    return await this.usersService.getUserInfo(req.user?.id);
  }

  @UseInterceptors(AuthInterceptor)
  @Get('/tickets')
  @ApiHeader({
    name: 'x-auth-token',
  })
  @ApiOperation({
    summary: 'Needs auth, returns user tickets',
  })
  async getUserTickets(@Request() req: any) {
    return await this.usersService.getUserTickets(req.user?.id);
  }
}
