import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    required: true,
  })
  email: string;

  @MinLength(6)
  @ApiProperty({
    description: 'Username, must be at least 6 characters long',
    required: true,
  })
  username: string;

  @MinLength(8)
  @ApiProperty({
    description: 'User password, must be at least 8 characters long',
    required: true,
  })
  password: string;
}
