import { ResultType } from './../types';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class PlaceBetDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Match id',
    required: true,
  })
  matchId: string;

  @IsIn(['home', 'draw', 'away', 'under', 'over'])
  @ApiProperty({
    description: 'Match result sign, can be home, draw, away, under, over',
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
