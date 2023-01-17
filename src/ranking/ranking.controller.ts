import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankingService } from './ranking.service';

@Controller('ranking')
@ApiTags('RANKING')
export class RankingController {
  constructor(private rankingService: RankingService) {}
  @Get()
  @ApiOperation({
    summary: 'Returns a list of all the users ordered by account balance',
  })
  getRanking() {
    return this.rankingService.getRanking();
  }

  @Get('/maxwins')
  @ApiOperation({
    summary: 'Returns a list of all the users ordered by bigger win ever had',
  })
  getBestMultiplier() {
    return this.rankingService.getBestMultiplier();
  }
}
