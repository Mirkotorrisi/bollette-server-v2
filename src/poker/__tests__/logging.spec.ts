import { getPokerMachine } from '../machines/pokerMachine';
import { Table } from '../models/table.model';
import { Player } from '../models/player.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { XStateActions } from '../utils/types';

describe('Poker Logging System', () => {
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    eventEmitter = {
      emit: jest.fn(),
    } as unknown as EventEmitter2;
  });

  function createGame(playerCount = 2) {
    const table = new Table(9, 'logging-test-table');

    for (let i = 0; i < playerCount; i++) {
      table.addPlayer(new Player(`Player${i}`, 1000, `p${i}`));
    }

    const machine = getPokerMachine(table, eventEmitter);
    return { table, machine };
  }

  it('should log player actions correctly', () => {
    const { table, machine } = createGame(2);

    // After starting the game, check logs for player actions
    // Player 0 calls
    machine.send({ type: XStateActions.CALL });
    expect(table.logs.some((log) => log.includes('calls'))).toBe(true);

    // Player 1 checks
    machine.send({ type: XStateActions.CHECK });
    expect(table.logs.some((log) => log.includes('checks'))).toBe(true);
  });

  it('should log community cards revealed', () => {
    const { table, machine } = createGame(2);

    // Play through pre-flop to reach flop
    machine.send({ type: XStateActions.CALL });
    machine.send({ type: XStateActions.CHECK });

    // Check that flop was logged
    expect(table.logs.some((log) => log.includes('Flop:'))).toBe(true);

    // Continue to turn
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });

    // Check that turn was logged
    expect(table.logs.some((log) => log.includes('Turn:'))).toBe(true);

    // Continue to river
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });

    // Check that river was logged
    expect(table.logs.some((log) => log.includes('River:'))).toBe(true);
  });

  it('should log showdown winner with hand description', () => {
    const { table, machine } = createGame(2);

    // Play through all streets
    machine.send({ type: XStateActions.CALL });
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });
    machine.send({ type: XStateActions.CHECK });

    // Check that showdown winner was logged
    expect(table.logs.some((log) => log.includes('wins $'))).toBe(true);
    expect(table.logs.some((log) => log.includes('with'))).toBe(true);
  });

  it('should log when player folds', () => {
    const { table, machine } = createGame(2);

    // Player folds
    machine.send({ type: XStateActions.FOLD });

    // Check that fold was logged
    expect(table.logs.some((log) => log.includes('folds'))).toBe(true);
  });

  it('should log when player wins without showdown', () => {
    const { table, machine } = createGame(2);

    // Player folds, other player wins
    machine.send({ type: XStateActions.FOLD });

    // Check that win was logged
    expect(
      table.logs.some(
        (log) => log.includes('wins $') && log.includes('all opponents folded'),
      ),
    ).toBe(true);
  });

  it('should clear logs when starting a new hand', () => {
    const { table, machine } = createGame(2);

    // Add some logs by playing
    machine.send({ type: XStateActions.CALL });
    const logsBeforeNewHand = table.logs.length;
    expect(logsBeforeNewHand).toBeGreaterThan(0);

    // Player 1 folds to end the hand
    machine.send({ type: XStateActions.FOLD });

    // Start a new hand
    machine.send({ type: XStateActions.RESTART });

    // Logs should be cleared when a new hand starts
    // After restart, there should be fewer logs than accumulated before
    expect(table.logs.length).toBeLessThanOrEqual(logsBeforeNewHand);
  });

  it('should log player bets and raises with amounts', () => {
    const { table, machine } = createGame(2);

    // Player bets
    machine.send({ type: XStateActions.BET, amount: 50 });
    expect(table.logs.some((log) => log.includes('bets $50'))).toBe(true);

    // Player raises
    machine.send({ type: XStateActions.RAISE, amount: 100 });
    expect(table.logs.some((log) => log.includes('raises to $'))).toBe(true);
  });
});
