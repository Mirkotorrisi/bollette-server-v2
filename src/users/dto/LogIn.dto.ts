import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username or email to login',
    required: true,
  })
  usernameOrEmail: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'User password',
    required: true,
  })
  password: string;
}
