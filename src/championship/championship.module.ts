import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { ChampionshipController } from './championship.controller';
import { ChampionshipService } from './championship.service';

@Module({
  imports: [HttpModule, RedisModule],
  providers: [ChampionshipService],
  controllers: [ChampionshipController],
})
export class ChampionshipModule {}
