import { Module } from '@nestjs/common';
import { TableService } from './services/table.service';
import { PokerGateway } from './poker.gateway';
import { APP_GUARD } from '@nestjs/core';
import { PlayerService } from './services/player.service';
import { NoEmptyDataGuard } from './guard/no-empty-data.guard';

@Module({
  providers: [
    TableService,
    PlayerService,
    PokerGateway,
    {
      provide: APP_GUARD,
      useClass: NoEmptyDataGuard,
    },
  ],
})
export class PokerModule {}
