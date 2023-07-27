import { Injectable } from '@nestjs/common';
import { Player } from '../models/player.model';
import { v4 as uuidv4 } from 'uuid';
import { Table } from '../models/table.model';
import { getPokerMachine } from '../machines/pokerMachine';
import { Subject } from 'rxjs';
import { HandRound, XStateActions } from '../utils/types';

type PokerMachine = ReturnType<typeof getPokerMachine>;
type SubscriptionPayload = { table: Table; action: XStateActions };
const TIME_BANK = 20000;
@Injectable()
export class TableService {
  private tables: Map<string, PokerMachine> = new Map<string, PokerMachine>();
  private subject = new Subject<SubscriptionPayload>();
  private intervals = {};

  createTable() {
    const tableId = uuidv4();
    const table = new Table(9, tableId);
    const machine = getPokerMachine(table);
    this.tables.set(tableId, machine);
    return tableId;
  }

  joinTable(tableId: string, player: Player) {
    const tableMachine = this.tables.get(tableId);
    tableMachine?.send({
      type: 'JOIN_TABLE',
      player: new Player(player.name, player.chips, player.id),
    });
    this.createTableTimeout(tableId);
    if (this.isShowDown(tableMachine)) {
      this.startNewHandTimeout(tableMachine);
      return tableMachine?.initialState.context.table;
    }
    return this.filterPlayerCards(tableMachine?.initialState.context.table);
  }

  leaveTable(tableId: string, player: Player) {
    const tableMachine = this.tables.get(tableId);
    tableMachine?.send({ type: XStateActions.LEAVE_TABLE, player });
    if (!tableMachine?.initialState.context.table.players.length)
      this.tables.delete(tableId);
    if (this.isShowDown(tableMachine)) {
      this.startNewHandTimeout(tableMachine);
      return tableMachine?.initialState.context.table;
    }
    return this.filterPlayerCards(tableMachine?.initialState.context.table);
  }

  getTable(tableId: string) {
    // Retrieve the table state from memory
    return this.tables.get(tableId).machine.context.table;
  }

  handleBet(tableId: string, amount: number) {
    this.stopTimeout(tableId);
    const tableMachine = this.tables.get(tableId);
    tableMachine?.send({
      type: XStateActions.BET,
      amount,
    });
    this.createTableTimeout(tableId);
    if (this.isShowDown(tableMachine)) {
      this.startNewHandTimeout(tableMachine);
      return tableMachine?.initialState.context.table;
    }
    return this.filterPlayerCards(tableMachine?.initialState.context.table);
  }

  handleRaise(tableId: string, amount: number) {
    this.stopTimeout(tableId);
    const tableMachine = this.tables.get(tableId);
    tableMachine?.send({
      type: XStateActions.RAISE,
      amount,
    });
    this.createTableTimeout(tableId);
    if (this.isShowDown(tableMachine)) {
      this.startNewHandTimeout(tableMachine);
      return tableMachine?.initialState.context.table;
    }
    return this.filterPlayerCards(tableMachine?.initialState.context.table);
  }

  handleFold(tableId: string) {
    this.stopTimeout(tableId);
    const tableMachine = this.tables.get(tableId);
    tableMachine?.send({
      type: XStateActions.FOLD,
    });
    this.createTableTimeout(tableId);
    if (this.isShowDown(tableMachine)) {
      this.startNewHandTimeout(tableMachine);
      return tableMachine?.initialState.context.table;
    }
    return this.filterPlayerCards(tableMachine?.initialState.context.table);
  }

  handleCheck(tableId: string) {
    this.stopTimeout(tableId);
    const tableMachine = this.tables.get(tableId);
    tableMachine?.send({
      type: XStateActions.CHECK,
    });
    this.createTableTimeout(tableId);
    if (this.isShowDown(tableMachine)) {
      this.startNewHandTimeout(tableMachine);
      return tableMachine?.initialState.context.table;
    }
    return this.filterPlayerCards(tableMachine?.initialState.context.table);
  }

  handleCall(tableId: string) {
    this.stopTimeout(tableId);
    const tableMachine = this.tables.get(tableId);
    tableMachine?.send({
      type: XStateActions.CALL,
    });
    this.createTableTimeout(tableId);
    if (this.isShowDown(tableMachine)) {
      this.startNewHandTimeout(tableMachine);
      return tableMachine?.initialState.context.table;
    }
    return this.filterPlayerCards(tableMachine?.initialState.context.table);
  }

  isShowDown(tableMachine: PokerMachine) {
    return (
      tableMachine?.initialState.context.table.currentRound ===
      HandRound.SHOWDOWN
    );
  }

  startNewHandTimeout(tableMachine: PokerMachine) {
    setTimeout(() => {
      tableMachine.send({
        type: XStateActions.RESTART,
      });
      this.subject.next({
        table: this.filterPlayerCards(
          tableMachine?.initialState.context.table,
        ) as Table,
        action: XStateActions.RESTART,
      });
    }, 4000);
  }

  getUserTables(userId: string) {
    return Array.from(this.tables)
      .filter(([_, m]: [string, PokerMachine]) =>
        m.machine.context.table.players.some((p) => p.id === userId),
      )
      .map(([id, m]) => [id, this.filterPlayerCards(m.machine.context.table)]);
  }

  createTableTimeout(tableId: string) {
    this.stopTimeout(tableId);
    const tableMachine = this.tables.get(tableId);
    if (!tableMachine) return;
    const interval = setTimeout(() => {
      tableMachine?.send({
        type: 'FOLD',
      });
      this.subject.next({
        table: this.filterPlayerCards(
          tableMachine?.initialState.context.table,
        ) as Table,
        action: XStateActions.FOLD,
      });
      this.createTableTimeout(tableId);
    }, TIME_BANK);
    this.intervals[tableId] = interval;
  }

  filterPlayerCards(table: Table) {
    return {
      ...table,
      players: table.players.map((p) => ({ ...p, hand: [] })),
    };
  }

  stopTimeout(tableId: string) {
    clearTimeout(this.intervals[tableId]);
  }

  get tableSubject$() {
    return this.subject.asObservable();
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
