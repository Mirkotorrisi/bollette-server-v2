import { Table } from '../models/table.model';
import { Player } from '../models/player.model';
import { getPokerMachine } from '../machines/pokerMachine';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Player Awaiting Status', () => {
  let table: Table;
  let eventEmitter: EventEmitter2;
  let machine: any;

  beforeEach(() => {
    table = new Table(6, 'test-table');
    eventEmitter = new EventEmitter2();
    machine = getPokerMachine(table, eventEmitter);
  });

  it('should set newly joined player to WAITING if a hand is in progress', () => {
    const p1 = new Player('P1', 1000, '1');
    const p2 = new Player('P2', 1000, '2');
    const p3 = new Player('P3', 1000, '3');

    // Start a hand with P1 and P2
    machine.send({ type: 'JOIN_TABLE', player: p1 });
    machine.send({ type: 'JOIN_TABLE', player: p2 });

    expect(table.isHandOver).toBe(false);
    expect(p1.state).not.toBe('WAITING');
    expect(p2.state).not.toBe('WAITING');

    // P3 joins during the hand
    machine.send({ type: 'JOIN_TABLE', player: p3 });

    expect(p3.state).toBe('WAITING');
    expect(p3.isAwaiting).toBe(true);
  });

  it('should ignore WAITING players during betting rounds', () => {
    const p1 = new Player('P1', 1000, '1');
    const p2 = new Player('P2', 1000, '2');
    const p3 = new Player('P3', 1000, '3');

    machine.send({ type: 'JOIN_TABLE', player: p1 });
    machine.send({ type: 'JOIN_TABLE', player: p2 });
    machine.send({ type: 'JOIN_TABLE', player: p3 });

    // P1 and P2 are in hand, P3 is awaiting
    expect(p3.isAwaiting).toBe(true);

    // Current player should be P1 (SB in heads-up? No, Dealer is P0, P1 is BB. In 2 players, Dealer is SB and acts first pre-flop)
    // Actually Table.model line 203: Heads-up: Dealer acts first.
    expect(table.currentPlayer.id).toBe(p1.id);

    // P1 calls
    machine.send({ type: 'CALL' });

    // Next player should be P2, skipping P3
    expect(table.currentPlayer.id).toBe(p2.id);

    // P2 checks
    machine.send({ type: 'CHECK' });

    // Should transition to FLOP, skipping P3
    expect(machine.getSnapshot().matches('flop')).toBe(true);
  });

  it('should make WAITING players active in the next hand', () => {
    const p1 = new Player('P1', 1000, '1');
    const p2 = new Player('P2', 1000, '2');
    const p3 = new Player('P3', 1000, '3');

    machine.send({ type: 'JOIN_TABLE', player: p1 });
    machine.send({ type: 'JOIN_TABLE', player: p2 });
    machine.send({ type: 'JOIN_TABLE', player: p3 });

    expect(p3.isAwaiting).toBe(true);

    // Finish hand (P1 folds)
    machine.send({ type: 'FOLD' });

    expect(table.isHandOver).toBe(true);
    // In our implementation, handResult state triggers START_NEW_HAND event which has a timeout.
    // For testing, we can manually trigger RESTART or call startNewHand on table if we want to bypass machine flow,
    // but better to test the machine flow.

    // In handResult, the machine waits for RESTART.
    expect(machine.getSnapshot().matches('handResult')).toBe(true);

    // Manually trigger restart (simulating the timeout)
    machine.send({ type: 'RESTART' });

    expect(machine.getSnapshot().matches('preFlop')).toBe(true);
    expect(p3.state).toBe('IDLE'); // reset() sets it to IDLE
    expect(p3.isAwaiting).toBe(false);
    expect(p3.hand.length).toBe(2);
  });
});
