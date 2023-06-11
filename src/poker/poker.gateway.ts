import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { TableService } from './services/table.service';
import { Actions, TableAndAmount, TableAndPlayer } from './utils/types';
import { TablePlayerGuard } from './guard/table-player.guard';
import { NoEmptyDataGuard } from './guard/no-empty-data.guard';
import { PlayerService } from './services/player.service';
import { TableAmountGuard } from './guard/table-amount.guard';

@Injectable()
@WebSocketGateway({ cors: true })
@UseGuards(NoEmptyDataGuard)
export class PokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

  @SubscribeMessage(Actions.CREATE_TABLE)
  handleCreateTable(client: Socket, playerId: string) {
    const player = this.playerService.getPlayer(playerId);
    this.logger.log(`Player ${player.name} is creating a table`);
    const tableId = this.tableService.createTable();
    const table = this.tableService.joinTable(tableId, player);
    this.server.emit(Actions.CREATE_TABLE, table);
    this.server.emit(Actions.ALL_TABLES, this.tableService.allTables);
    const tables = this.tableService.getUserTables(player.id);
    client.emit(Actions.ALL_USER_TABLES, tables);
    client.join(tableId);
    this.server.to(tableId).emit(Actions.JOIN, table);
  }

  @SubscribeMessage(Actions.JOIN)
  @UseGuards(TablePlayerGuard)
  handleJoinTable(client: Socket, { tableId, playerId }: TableAndPlayer) {
    const player = this.playerService.getPlayer(playerId);
    this.logger.log(`Player ${player.name} is joining table ${tableId}.`);
    const table = this.tableService.joinTable(tableId, player);

    this.server.emit(Actions.ALL_TABLES, this.tableService.allTables);
    const tables = this.tableService.getUserTables(player.id);
    client.emit(Actions.ALL_USER_TABLES, tables);
    client.join(tableId);
    this.server.to(tableId).emit(Actions.JOIN, table);
  }

  @SubscribeMessage(Actions.LEAVE)
  @UseGuards(TablePlayerGuard)
  handleLeaveTable(client: Socket, { tableId, playerId }: TableAndPlayer) {
    const player = this.playerService.getPlayer(playerId);
    this.logger.log(`Player ${player.name} is leaving table ${tableId}.`);
    const table = this.tableService.leaveTable(tableId, player);
    client.emit(
      Actions.ALL_USER_TABLES,
      this.tableService.getUserTables(player.id),
    );
    client.leave(tableId);
    this.server.emit(Actions.ALL_TABLES, this.tableService.allTables);
    this.server.to(tableId).emit(Actions.LEAVE, table);
  }

  @SubscribeMessage(Actions.BET)
  @UseGuards(TableAmountGuard)
  handleBet(client: Socket, { tableId, amount }: TableAndAmount) {
    this.logger.log(`Player bets ${amount} on table ${tableId}.`);
    const table = this.tableService.handleBet(tableId, amount);

    this.server.to(tableId).emit(Actions.BET, table);
  }

  @SubscribeMessage(Actions.RAISE)
  @UseGuards(TableAmountGuard)
  handleRaise(client: Socket, { tableId, amount }: TableAndAmount) {
    this.logger.log(`Player raise ${amount} on table ${tableId}.`);
    const table = this.tableService.handleRaise(tableId, amount);
    this.server.to(tableId).emit(Actions.RAISE, table);
  }

  @SubscribeMessage(Actions.CHECK)
  handleCheck(client: Socket, tableId: string) {
    this.logger.log(`Player check on table ${tableId}.`);
    const table = this.tableService.handleCheck(tableId);
    this.server.to(tableId).emit(Actions.CHECK, table);
  }

  @SubscribeMessage(Actions.FOLD)
  handleFold(client: Socket, tableId: string) {
    this.logger.log(`Player fold on table ${tableId}.`);
    const table = this.tableService.handleFold(tableId);
    this.server.to(tableId).emit(Actions.FOLD, table);
  }

  @SubscribeMessage(Actions.CALL)
  handleCall(client: Socket, tableId: string) {
    this.logger.log(`Player call on table ${tableId}.`);
    const table = this.tableService.handleCall(tableId);
    this.server.to(tableId).emit(Actions.CALL, table);
  }
}
