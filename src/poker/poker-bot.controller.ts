import {
  Controller,
  Inject,
  forwardRef,
  Post,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { PokerGateway } from './poker.gateway';
import { PlayerService } from './services/player.service';
import { TableService } from './services/table.service';
import { Actions } from './utils/types';
import { Logger } from '@nestjs/common';

@Controller('bots')
export class PokerBotController {
  private logger: Logger = new Logger('PokerBotController');

  constructor(
    private readonly tableService: TableService,
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => PokerGateway))
    private readonly pokerGateway: PokerGateway,
  ) {}

  @Post('join/:tableId')
  spawnBot(@Param('tableId') tableId: string, @Body('name') name: string) {
    const bot = this.playerService.createPlayer(name || 'AI_Player', true);

    this.pokerGateway.server.to(tableId).emit('ASK_FOR_CARDS', tableId);

    this.logger.log(`Player ${bot.name} is joining table ${tableId}.`);
    const table = this.tableService.joinTable(tableId, bot);
    if (table.isFull) {
      throw new BadRequestException('Table is full');
    }
    this.pokerGateway.server.emit(
      Actions.ALL_TABLES,
      this.tableService.allTables,
    );
    this.pokerGateway.server.to(tableId).emit(Actions.JOIN, table, bot.id);
    this.pokerGateway.server.to(table.id).emit(Actions.ASK_FOR_CARDS, table.id);

    return { success: true, botId: bot.id };
  }
}
