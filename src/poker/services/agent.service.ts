import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { TableService } from './table.service';
import { Actions, Events, XStateActions } from '../utils/types';
import { PokerGateway } from '../poker.gateway';
import { Table } from '../models/table.model';
import { Player } from '../models/player.model';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PokerAgentService {
  private logger = new Logger('PokerAgent');

  constructor(
    private readonly tableService: TableService,
    @Inject(forwardRef(() => PokerGateway))
    private readonly gateway: PokerGateway,
  ) {}

  @OnEvent(Events.HANDLE_BOT_TURN)
  handleBotTurn(payload: { table: Table }) {
    const activePlayer = payload.table.players.find((p) => p.isCurrentPlayer);
    if (!activePlayer?.isBot) return;
    setTimeout(() => {
      this.makeDecision(payload.table, activePlayer);
    }, 2000);
  }

  private makeDecision(table: Table, botPlayer: Player) {
    const decision = this.calculateBestMove(table, botPlayer);
    console.log('🚀 ~ PokerAgentService ~ makeDecision ~ decision:', decision);

    const tableRes = this.tableService.handleAction(
      table.id,
      decision.action,
      decision.amount,
    );
    this.gateway.server.to(table.id).emit(decision.socketAction, tableRes);
  }

  private calculateBestMove(table: Table, botPlayer: Player) {
    const choices = botPlayer.availableChoices;
    const random = Math.random();
    if (random > 0.8 && choices.includes(XStateActions.RAISE))
      return {
        socketAction: Actions.RAISE,
        action: XStateActions.RAISE,
        amount: table.highestBet * 1.5,
      };
    if (random > 0.3 && choices.includes(XStateActions.CALL))
      return { socketAction: Actions.CALL, action: XStateActions.CALL };
    if (choices.includes(XStateActions.CHECK))
      return { socketAction: Actions.CHECK, action: XStateActions.CHECK };
    return { socketAction: Actions.FOLD, action: XStateActions.FOLD };
  }
}
