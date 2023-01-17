import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SubmitCheckoutDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(2)
  @ApiProperty({
    description: 'Bet import',
    required: true,
    example: 5,
  })
  betImport: number;
}
