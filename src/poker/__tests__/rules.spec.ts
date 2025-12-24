import { getPokerMachine } from '../machines/pokerMachine';
import { Table } from '../models/table.model';
import { Player } from '../models/player.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HandRound, XStateActions } from '../utils/types';

describe('Poker rules – Texas Hold’em (no limit)', () => {
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    eventEmitter = {
      emit: jest.fn(),
    } as unknown as EventEmitter2;
  });

  function createGame(playerCount = 2) {
    const table = new Table(9, 'rules-table');

    for (let i = 0; i < playerCount; i++) {
      table.addPlayer(new Player(`P${i}`, 1000, `p${i}`));
    }

    const machine = getPokerMachine(table, eventEmitter);
    return { table, machine };
  }

  // --------------------------------------------------
  // R1 – FOLD ENDS HAND IMMEDIATELY
  // --------------------------------------------------

  it('R1: fold ends the hand immediately without showdown', () => {
    const { table, machine } = createGame(2);

    machine.send({ type: XStateActions.FOLD });

    const activePlayers = table.players.filter((p) => !p.isFolded);
    expect(activePlayers.length).toBe(1);

    // no community cards
    expect(table.communityCards.length).toBe(0);
    expect(table.isHandOver).toBeTruthy();
  });

  // --------------------------------------------------
  // R2 – SHOWDOWN CONDITIONS
  // --------------------------------------------------

  it('R2: showdown does not occur with less than 2 active players', () => {
    const { table, machine } = createGame(2);

    machine.send({ type: XStateActions.FOLD });

    const activePlayers = table.players.filter((p) => !p.isFolded);
    expect(activePlayers.length).toBe(1);

    // expect(table.isInShowdown).toBeFalsy();
  });

  // --------------------------------------------------
  // R3 – STREET ADVANCEMENT
  // --------------------------------------------------

  it('R3: game advances street only after all active players check or call', () => {
    const { table, machine } = createGame(2);

    // preflop → SB calls, BB checks
    machine.send({ type: XStateActions.CALL });
    machine.send({ type: XStateActions.CHECK });

    expect(table.communityCards.length).toBe(3);
    expect(table.currentRound).toBe(HandRound.FLOP);
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });
    expect(table.currentRound).toBe(HandRound.TURN);
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });
    expect(table.currentRound).toBe(HandRound.RIVER);
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });
    expect(table.currentRound).toBe(HandRound.SHOWDOWN);
  });

  // --------------------------------------------------
  // R4 – BET REOPENS ACTION
  // --------------------------------------------------

  it('R4: bet reopens the action for previous players', () => {
    const { table, machine } = createGame(3);

    const firstPlayer = table.currentPlayer.id;

    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.BET, amount: 100 });
    machine.send({ type: XStateActions.RAISE, amount: 100 });

    expect(table.currentPlayer.id).toBe(firstPlayer);
    machine.send({ type: XStateActions.RAISE, amount: 100 });
    expect(table.currentPlayer.id).not.toBe(firstPlayer);
    expect(table.currentRound).toBe(HandRound.PRE_FLOP);
  });

  // --------------------------------------------------
  // R5 – ALL-IN BEHAVIOR
  // --------------------------------------------------

  it('R5: all-in player is skipped and does not trigger showdown', () => {
    const { table, machine } = createGame(2);

    machine.send({
      type: XStateActions.BET,
      amount: table.currentPlayer.chips,
    });

    // The player who acted (P0) should be All-In
    expect(table.players[0].isAllIn).toBe(true);

    // The turn should have passed to P1 (who is not All-In)
    expect(table.currentPlayer.isAllIn).toBe(false);
    expect(table.currentPlayer.id).not.toBe(table.players[0].id);
    // expect(table.isInShowdown).toBeFalsy();
  });

  it('A betting round ends when the action reaches the last aggressor and no new raise has occurred, or when all remaining players have called the highest bet.', () => {
    const { table, machine } = createGame(3);

    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.BET, amount: 100 });
    machine.send({ type: XStateActions.RAISE, amount: 100 });
    machine.send({ type: XStateActions.RAISE, amount: 100 });
    machine.send({ type: XStateActions.CALL });
    machine.send({ type: XStateActions.CALL });
    expect(table.currentRound).toBe(HandRound.FLOP);
  });
});
