import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RemoveBetDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Match id',
    required: true,
    example: 'EMP-SAM2023-01-16',
  })
  matchId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Ticket id',
  })
  ticket_id: number;
}
