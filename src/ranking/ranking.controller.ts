import { Controller, Get } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private rankingService: RankingService) {}
  @Get()
  getRanking() {
    return this.rankingService.getRanking();
  }

  @Get('/maxwins')
  getBestMultiplier() {
    return this.rankingService.getBestMultiplier();
  }
}
