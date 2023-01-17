import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'User id',
    required: true,
  })
  id: number;
}
