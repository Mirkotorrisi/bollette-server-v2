import { mkts } from '../utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { sport_keys } from '../utils';

export class ChampionshipDto {
  @IsIn(Object.keys(sport_keys))
  @ApiProperty({
    description: 'Championship parameter',
    example: 'serie_a',
    required: true,
  })
  championship: string;
}

export class MktDto {
  @IsIn(mkts)
  @ApiProperty({
    description: 'Markets parameter',
    example: 'h2h',
    required: true,
  })
  mkt: string;
}
