import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChampionshipService } from './championship.service';
import { ChampionshipDto, MktDto } from './dto/GetMatches.dto';

@Controller('championships')
@ApiTags('CHAMPIONSHIPS')
export class ChampionshipController {
  constructor(private championshipService: ChampionshipService) {}

  @Get('/:championship/:mkt')
  @ApiOperation({
    summary:
      'Returns match list, given a championship and a market (head to head or totals)',
  })
  async getMatches(
    @Param('championship') championship: ChampionshipDto,
    @Param('mkt') mkt: MktDto,
  ) {
    return await this.championshipService.getMatches(
      String(championship),
      String(mkt),
    );
  }
}
