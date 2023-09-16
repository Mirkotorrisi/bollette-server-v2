import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  UseGuards,
} from '@nestjs/common';
import { TableService } from './services/table.service';
import {
  Actions,
  TableAndAmount,
  TableAndPlayer,
  XStateActions,
} from './utils/types';
import { TablePlayerGuard } from './guard/table-player.guard';
import { NoEmptyDataGuard } from './guard/no-empty-data.guard';
import { PlayerService } from './services/player.service';
import { TableAmountGuard } from './guard/table-amount.guard';
import { Subscription } from 'rxjs';

@Injectable()
@WebSocketGateway({ cors: true })
@UseGuards(NoEmptyDataGuard)
export class PokerGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    OnApplicationShutdown
{
  private tableSubscription: Subscription;

  constructor(
    private readonly tableService: TableService,
    private readonly playerService: PlayerService,
  ) {}
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PokerGateway');

  handleConnection(client: Socket) {
    const playerName = client.handshake.auth.name;

    this.logger.log(`Client ${client.id} connected to poker gateway.`);
    const player = this.playerService.createPlayer(playerName);

    client.emit(Actions.SET_PLAYER, player);
    client.emit(Actions.ALL_TABLES, this.tableService.allTables);
    client.emit(
      Actions.ALL_USER_TABLES,
      this.tableService.getUserTables(player.id),
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected from poker gateway.`);
  }

  afterInit(server): void {
    this.tableSubscription = this.tableService.tableSubject$.subscribe({
      next: ({ table, action }) => {
        switch (action) {
          case XStateActions.FOLD:
            this.logger.log(`Forced fold due to timeout ${table.id}.`);
            server.to(table.id).emit(Actions.FOLD, table);
            break;
          case XStateActions.RESTART:
            this.logger.log(`Starting a new hand on ${table.id}.`);
            server.to(table.id).emit(Actions.CHECK, table);
          case XStateActions.ASK_FOR_CARDS:
            this.logger.log(`Sending player cards ${table.id}.`);
            server.to(table.id).emit(Actions.ASK_FOR_CARDS);
          default:
            break;
        }
      },
      error: (err) => server.emit('exception', err),
    });
  }

  onApplicationShutdown() {
    this.tableSubscription.unsubscribe();
  }

  @SubscribeMessage(Actions.CREATE_TABLE)
  handleCreateTable(client: Socket, playerId: string) {
    const player = this.playerService.getPlayer(playerId);
    this.logger.log(`Player ${player.name} is creating a table`);
    const tableId = this.tableService.createTable();
    const table = this.tableService.joinTable(tableId, player);
    this.server.emit(Actions.CREATE_TABLE, table);
    this.server.emit(Actions.ALL_TABLES, this.tableService.allTables);
    this.server.to(tableId).emit(Actions.JOIN, table);
    const userTables = this.tableService.getUserTables(player.id);
    client.emit(Actions.ALL_USER_TABLES, userTables);
    client.join(tableId);
  }

  @SubscribeMessage(Actions.JOIN)
  @UseGuards(TablePlayerGuard)
  handleJoinTable(client: Socket, { tableId, playerId }: TableAndPlayer) {
    const player = this.playerService.getPlayer(playerId);
    this.logger.log(`Player ${player.name} is joining table ${tableId}.`);
    const table = this.tableService.joinTable(tableId, player);
    this.server.emit(Actions.ALL_TABLES, this.tableService.allTables);
    this.server.to(tableId).emit(Actions.JOIN, table, playerId);
    const userTables = this.tableService.getUserTables(player.id);
    client.emit(Actions.ALL_USER_TABLES, userTables);
    client.join(tableId);
    this.server.to(table.id).emit(Actions.ASK_FOR_CARDS, table.id);
  }

  @SubscribeMessage(Actions.LEAVE)
  @UseGuards(TablePlayerGuard)
  handleLeaveTable(client: Socket, { tableId, playerId }: TableAndPlayer) {
    const player = this.playerService.getPlayer(playerId);
    if (!player) return;
    this.logger.log(`Player ${player.name} is leaving table ${tableId}.`);
    const table = this.tableService.leaveTable(tableId, player);
    this.server.emit(Actions.ALL_TABLES, this.tableService.allTables);
    this.server.to(tableId).emit(Actions.LEAVE, table, playerId);
    client.emit(
      Actions.ALL_USER_TABLES,
      this.tableService.getUserTables(player.id),
    );
    client.leave(tableId);
  }

  @SubscribeMessage(Actions.GET_PLAYER_CARDS)
  getPlayerCards(client: Socket, tableId: string) {
    const playerName = client.handshake.auth.name;
    const hand = this.tableService.getPlayerCards(tableId, playerName);
    client.emit(Actions.GET_PLAYER_CARDS, { tableId, hand });
  }

  @SubscribeMessage(Actions.BET)
  @UseGuards(TableAmountGuard)
  handleBet(client: Socket, { tableId, amount }: TableAndAmount) {
    this.logger.log(`Player bets ${amount} on table ${tableId}.`);
    const table = this.tableService.handleAction(
      tableId,
      XStateActions.BET,
      amount,
    );
    this.server.to(tableId).emit(Actions.BET, table);
  }

  @SubscribeMessage(Actions.RAISE)
  @UseGuards(TableAmountGuard)
  handleRaise(client: Socket, { tableId, amount }: TableAndAmount) {
    this.logger.log(`Player raise ${amount} on table ${tableId}.`);
    const table = this.tableService.handleAction(
      tableId,
      XStateActions.RAISE,
      amount,
    );
    this.server.to(tableId).emit(Actions.RAISE, table);
  }

  @SubscribeMessage(Actions.CHECK)
  handleCheck(client: Socket, tableId: string) {
    this.logger.log(`Player check on table ${tableId}.`);
    const table = this.tableService.handleAction(tableId, XStateActions.CHECK);
    this.server.to(tableId).emit(Actions.CHECK, table);
  }

  @SubscribeMessage(Actions.FOLD)
  handleFold(client: Socket, tableId: string) {
    this.logger.log(`Player fold on table ${tableId}.`);
    const table = this.tableService.handleAction(tableId, XStateActions.FOLD);
    this.server.to(tableId).emit(Actions.FOLD, table);
  }

  @SubscribeMessage(Actions.CALL)
  handleCall(client: Socket, tableId: string) {
    this.logger.log(`Player call on table ${tableId}.`);
    const table = this.tableService.handleAction(tableId, XStateActions.CALL);
    this.server.to(tableId).emit(Actions.CALL, table);
  }
}
