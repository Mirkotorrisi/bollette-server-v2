import { Module } from '@nestjs/common';
import { ChampionshipService } from './championship.service';
import { ChampionshipController } from './championship.controller';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [HttpModule, RedisModule],
  providers: [ChampionshipService],
  controllers: [ChampionshipController],
})
export class ChampionshipModule {}
