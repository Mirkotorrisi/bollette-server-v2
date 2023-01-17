import { Controller, Get, Param } from '@nestjs/common';
import { ChampionshipService } from './championship.service';
import { ChampionshipDto, MktDto } from './dto/GetMatches.dto';

@Controller('championships')
export class ChampionshipController {
  constructor(private championshipService: ChampionshipService) {}

  @Get('/:championship/:mkt')
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
