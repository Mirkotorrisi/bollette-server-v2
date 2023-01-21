import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ResultType } from '../types';

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

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BetDto)
  @IsArray()
  matches: BetDto[];

  @IsArray()
  championships: string[];

  @IsArray()
  markets: string[];
}

export class BetDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Match id',
    required: true,
  })
  matchId: string;

  @IsString()
  @ApiProperty({
    description: 'Match id from the odds api',
    required: true,
  })
  id: string;

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

  @IsArray()
  teams: string[];

  @IsString()
  start: string;

  @IsNumber()
  @Min(1)
  odd: number;
}
