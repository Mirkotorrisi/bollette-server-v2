import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class SpinSlotWheelDto {
  @IsNumber()
  @Min(2)
  @ApiProperty({
    description: 'Import of the bet, must be an integer greater or equal to 2',
    example: 2,
    required: true,
  })
  betImport: number;

  @IsNumber()
  @Min(2)
  @ApiProperty({
    description:
      'Number of wheels that will spin, must be an integer greater or equal to 2',
    example: 2,
    required: true,
  })
  numOfWheels: number;

  @IsNumber()
  @Min(2)
  @ApiProperty({
    description:
      'Number of symbols that will be present on each wheel, must be an integer greater or equal to 2',
    example: 2,
    required: true,
  })
  numOfSymbols: number;
}
