import { getPokerMachine } from '../machines/pokerMachine';
import { Table } from '../models/table.model';
import { Player } from '../models/player.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { XStateActions } from '../utils/types';

describe('Poker invariants', () => {
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    eventEmitter = {
      emit: jest.fn(),
    } as unknown as EventEmitter2;
  });

  function createGame(playerCount = 3) {
    const table = new Table(9, 'test-table');

    for (let i = 0; i < playerCount; i++) {
      table.addPlayer(new Player(`P${i}`, 1000, `p${i}`));
    }

    const machine = getPokerMachine(table, eventEmitter);
    return { table, machine };
  }

  // --------------------------------------------------
  // INVARIANT 1
  // --------------------------------------------------

  it('always has a valid current player', () => {
    const { table } = createGame(4);

    expect(table.currentPlayer).toBeDefined();
    expect(table.players).toContain(table.currentPlayer);
  });

  // --------------------------------------------------
  // INVARIANT 2
  // --------------------------------------------------

  it('current player is never folded', () => {
    const { table, machine } = createGame(3);

    // force some actions
    machine.send({ type: XStateActions.FOLD });
    machine.send({ type: XStateActions.FOLD });

    expect(table.currentPlayer.isFolded).toBe(false);
  });

  // --------------------------------------------------
  // INVARIANT 3
  // --------------------------------------------------

  it('total chips + pot is conserved', () => {
    const { table, machine } = createGame(3);

    const initialTotal =
      table.players.reduce((sum, p) => sum + p.chips, 0) + table.pot;

    machine.send({ type: XStateActions.BET, amount: 100 });
    machine.send({ type: XStateActions.CALL });
    machine.send({ type: XStateActions.CHECK });

    const finalTotal =
      table.players.reduce((sum, p) => sum + p.chips, 0) + table.pot;

    expect(finalTotal).toBe(initialTotal);
  });

  // --------------------------------------------------
  // INVARIANT 4
  // --------------------------------------------------

  it('a folded player never becomes current player again', () => {
    const { table, machine } = createGame(3);

    const foldedId = table.currentPlayer.id;
    machine.send({ type: XStateActions.FOLD });

    for (let i = 0; i < 5; i++) {
      machine.send({ type: XStateActions.CHECK });
      expect(table.currentPlayer.id).not.toBe(foldedId);
    }
  });

  // --------------------------------------------------
  // INVARIANT 5
  // --------------------------------------------------

  it('hand ends when only one active player remains', () => {
    const { table, machine } = createGame(2);

    machine.send({ type: XStateActions.FOLD });

    const activePlayers = table.players.filter((p) => !p.isFolded);
    expect(activePlayers.length).toBe(1);
  });

  // --------------------------------------------------
  // INVARIANT 6
  // --------------------------------------------------

  it('current player always belongs to table players', () => {
    const { table, machine } = createGame(4);

    for (let i = 0; i < 10; i++) {
      machine.send({ type: XStateActions.CHECK });
      expect(table.players.map((p) => p.id)).toContain(table.currentPlayer.id);
    }
  });
});
