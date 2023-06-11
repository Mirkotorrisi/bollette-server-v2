import { Injectable } from '@nestjs/common';
import { Player } from '../models/player.model';
import { v4 as uuidv4 } from 'uuid';
import { Table } from '../models/table.model';
import { getPokerMachine } from '../machines/pokerMachine';

type PokerMachine = ReturnType<typeof getPokerMachine>;

@Injectable()
export class TableService {
  private tables: Map<string, PokerMachine> = new Map<string, PokerMachine>();

  createTable() {
    const tableId = uuidv4();
    const table = new Table(9, tableId);
    const machine = getPokerMachine(table);
    this.tables.set(tableId, machine);
    return tableId;
  }

  joinTable(tableId: string, player: Player) {
    const tableMachine = this.tables.get(tableId);
    tableMachine.send({
      type: 'JOIN_TABLE',
      player: new Player(player.name, player.chips, player.id),
    });
    return tableMachine.initialState.context.table;
  }

  leaveTable(tableId: string, player: Player) {
    const tableMachine = this.tables.get(tableId);
    tableMachine.send({ type: 'LEAVE_TABLE', player });
    if (!tableMachine.initialState.context.table.players.length)
      this.tables.delete(tableId);
    return tableMachine.initialState.context.table;
  }

  getTable(tableId: string) {
    // Retrieve the table state from memory
    return this.tables.get(tableId).machine.context.table;
  }

  handleBet(tableId: string, amount: number) {
    const tableMachine = this.tables.get(tableId);
    tableMachine.send({
      type: 'BET',
      amount,
    });
    return tableMachine.initialState.context.table;
  }

  handleRaise(tableId: string, amount: number) {
    const tableMachine = this.tables.get(tableId);
    tableMachine.send({
      type: 'RAISE',
      amount,
    });
    return tableMachine.initialState.context.table;
  }

  handleFold(tableId: string) {
    const tableMachine = this.tables.get(tableId);
    tableMachine.send({
      type: 'FOLD',
    });
    return tableMachine.initialState.context.table;
  }

  handleCheck(tableId: string) {
    const tableMachine = this.tables.get(tableId);
    tableMachine.send({
      type: 'CHECK',
    });

    return tableMachine.initialState.context.table;
  }

  handleCall(tableId: string) {
    const tableMachine = this.tables.get(tableId);
    tableMachine.send({
      type: 'CALL',
    });
    return tableMachine.initialState.context.table;
  }

  getUserTables(userId: string) {
    return Array.from(this.tables)
      .filter(([_, m]: [string, PokerMachine]) =>
        m.machine.context.table.players.some((p) => p.id === userId),
      )
      .map(([id, m]) => [id, m.machine.context.table]);
  }

  get allTables() {
    return Array.from(this.tables).map(([key, m]: [string, PokerMachine]) => {
      return {
        id: key,
        players: m.machine.context.table.players.length,
      };
    });
  }
}
