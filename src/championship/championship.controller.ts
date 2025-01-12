import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ChampionshipService } from './championship.service';
import { ChampionshipEnum } from './dto/GetMatches.dto';

@Controller('championships')
@ApiTags('CHAMPIONSHIPS')
export class ChampionshipController {
  constructor(private championshipService: ChampionshipService) {}

  @Get('/all')
  @ApiOperation({
    summary: 'Returns match list, given a championship',
  })
  @ApiParam({ name: 'championship', enum: ChampionshipEnum })
  async getAllMatches(@Param('championship') championship: ChampionshipEnum) {
    return await this.championshipService.getMatches(championship);
  }

  @Get('/:championship')
  @ApiOperation({
    summary: 'Returns match list, given a championship',
  })
  @ApiParam({ name: 'championship', enum: ChampionshipEnum })
  async getMatches(@Param('championship') championship: ChampionshipEnum) {
    return await this.championshipService.getMatches(championship);
  }
}
