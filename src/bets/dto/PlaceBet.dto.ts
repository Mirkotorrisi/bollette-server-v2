import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { results, ResultType } from './../types';

export class PlaceBetDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Match id',
    required: true,
  })
  matchId: string;

  @IsIn(results)
  @ApiProperty({
    description: `Match result sign, can be ${results.join(', ')}`,
    required: true,
    example: 'draw',
  })
  result: ResultType;

  @IsOptional()
  @ApiProperty({
    description: 'Ticket id, can be optional',
  })
  ticket_id: number;
}
