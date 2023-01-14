import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/CreateUserDto.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService, authService: AuthService) {}

  @Post('/register')
  createUser(@Body() createUserDto: CreateUserDto) {}

  @Get()
  getAll() {
    return this.usersService.findAll();
  }
}
