import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BetDto)
  @IsArray()
  matches: BetDto[];

  @IsArray()
  @Length(1)
  championships: string[];

  @IsArray()
  @Length(1)
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
  @Length(2)
  teams: string[];

  @IsString()
  start: string;

  @IsNumber()
  @Min(1)
  odd: number;
}
