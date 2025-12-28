import { Module } from '@nestjs/common';
import { TableService } from './services/table.service';
import { PokerGateway } from './poker.gateway';
import { APP_GUARD } from '@nestjs/core';
import { PlayerService } from './services/player.service';
import { NoEmptyDataGuard } from './guard/no-empty-data.guard';
import { PokerBotController } from './poker-bot.controller';
import { PokerAgentService } from './services/agent.service';

@Module({
  providers: [
    TableService,
    PlayerService,
    PokerGateway,
    PokerAgentService,
    {
      provide: APP_GUARD,
      useClass: NoEmptyDataGuard,
    },
  ],
  controllers: [PokerBotController],
})
export class PokerModule {}
