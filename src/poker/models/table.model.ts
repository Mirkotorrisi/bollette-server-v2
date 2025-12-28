import { formatHand } from '../utils/handsUtils';
import { Card, HandRound } from '../utils/types';
import { Deck } from './deck.model';
import { Player } from './player.model';
import { Hand } from 'pokersolver';
import { Logger } from '@nestjs/common';

export class Table {
  dealerPosition = 0;
  currentRound = HandRound.PRE_FLOP;
  id: string;
  public players: Player[] = [];
  pot = 0;
  highestBet: number;
  smallBlind = 1;
  bigBlind = 2;
  communityCards: Card[] = [];
  deck = new Deck();
  currentPlayerPosition: number;
  firstPlayer: number;
  lastPlayerPosition: number;
  isHandOver = true;

  constructor(public readonly maxPlayers: number, id: string) {
    this.id = id;
  }

  get currentPlayersCount(): number {
    return this.players.length;
  }

  get isFull(): boolean {
    const bool = this.currentPlayersCount >= this.maxPlayers;
    Logger.debug(`isFull: ${bool}`, 'Table');
    return bool;
  }

  get dealerPlayer(): Player {
    return this.players.find((p) => p.position === this.dealerPosition);
  }

  get smallBlindPlayer(): Player {
    if (this.currentPlayersCount === 2) {
      return this.players.find((p) => p.position === this.dealerPosition);
    }
    return this.players.find(
      (p) =>
        p.position === (this.dealerPosition + 1) % this.currentPlayersCount,
    );
  }

  get bigBlindPlayer(): Player {
    if (this.currentPlayersCount === 2) {
      return this.players.find(
        (p) => p.position === (this.dealerPosition + 1) % 2,
      );
    }
    return this.players.find(
      (p) =>
        p.position === (this.dealerPosition + 2) % this.currentPlayersCount,
    );
  }

  get currentPlayer(): Player {
    return this.players.find((p) => p.position === this.currentPlayerPosition);
  }

  get isLastPlayerToTalk(): boolean {
    // The last player condition is met when:
    // - Has the highest bet and all the other players already matched it
    // or
    // - There are no other  get isLastPlayerToTalk(): boolean {
    if (
      this.currentPlayerPosition === undefined ||
      this.lastPlayerPosition === undefined
    ) {
      Logger.debug(
        `Checking isLastPlayerToTalk: no currentPlayerPosition or lastPlayerPosition`,
        'Table',
      );
      return false;
    }

    const activePlayers = this.players.filter(
      (p) => !p.isFolded && !p.isAllIn && !p.isAwaiting,
    );

    if (!activePlayers.length) {
      Logger.debug(`Checking isLastPlayerToTalk: no active players`, 'Table');
      return true;
    }

    // If there's at least one bet lower than the highest bet, the round is not over
    const needsToMatch = this.players.filter(
      (p) =>
        !p.isFolded && !p.isAllIn && !p.isAwaiting && p.bet < this.highestBet,
    );
    if (needsToMatch.length > 0) {
      Logger.debug(
        `Checking isLastPlayerToTalk: needs to match (needsToMatch: ${needsToMatch.length})`,
        'Table',
      );
      return false;
    }

    const isLast = this.currentPlayerPosition === this.lastPlayerPosition;
    Logger.debug(
      `Checking isLastPlayerToTalk: ${isLast} (current: ${this.currentPlayerPosition}, last: ${this.lastPlayerPosition})`,
      'Table',
    );
    return isLast;
  }

  get isOnePlayerLeft(): boolean {
    const bool =
      this.players.filter((p) => !p.isFolded && !p.isAwaiting).length === 1;
    Logger.debug(`isOnePlayerLeft: ${bool}`, 'Table');
    return bool;
  }

  get isTwoPlayerLeft(): boolean {
    const bool =
      this.players.filter((p) => !p.isFolded && !p.isAwaiting).length === 2;
    Logger.debug(`isTwoPlayerLeft: ${bool}`, 'Table');
    return bool;
  }

  get hasMoreThanOnePlayer(): boolean {
    const bool = this.players.filter((p) => p.chips > 0).length > 1;
    Logger.debug(`hasMoreThanOnePlayer: ${bool}`, 'Table');
    return bool;
  }

  get hasLeastOnePlayer(): boolean {
    const bool = !!this.players.length;
    Logger.debug(`hasLeastOnePlayer: ${bool}`, 'Table');
    return bool;
  }

  get getPlayers(): Player[] {
    return this.players.map(
      (p) =>
        ({
          ...p,
          hand: this.currentRound === HandRound.SHOWDOWN ? p.hand : [],
        } as Player),
    );
  }

  addPlayer(player: Player): boolean {
    if (this.isFull || this.players.some((p) => p.id === player.id)) {
      return false;
    }
    if (!this.isHandOver) {
      player.state = 'WAITING';
    }
    this.players.push(player);
    return true;
  }

  removePlayer(player: Player): void {
    const index = this.players.findIndex((p: Player) => p.id === player.id);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  startNewHand() {
    Logger.log(
      `Starting new hand. Players: ${this.players
        .map((p) => `${p.name}(${p.chips})`)
        .join(', ')}`,
      'Table',
    );
    this.isHandOver = false;
    this.deck = new Deck();
    this.pot = 0;
    this.communityCards = [];
    this.currentRound = HandRound.PRE_FLOP;

    // Reset players and deal cards
    this.players.forEach((player, index) => {
      player.reset();
      player.position = index;
      if (player.chips > 0) {
        player.hand = this.deck.dealTwoCards();
        Logger.debug(
          `Player ${player.name} dealt: ${player.hand
            .map((c) => c.rank + c.suit[0].toUpperCase())
            .join(', ')}`,
          'Table',
        );
      }
    });

    // In heads-up (2 players), Dealer is Small Blind and acts first pre-flop.
    // In 3+ players, Dealer is Pos 0, SB is Pos 1, BB is Pos 2, UTG is Pos 3.
    const isHeadsUp = this.currentPlayersCount === 2;

    // Pay blinds
    const sb = this.smallBlindPlayer;
    const bb = this.bigBlindPlayer;

    sb.payChips(this.smallBlind);
    bb.payChips(this.bigBlind);

    this.highestBet = this.bigBlind;
    this.pot = sb.bet + bb.bet;

    // Set starting player (Heads-up: Dealer acts first. 3+: UTG acts first)
    this.currentPlayerPosition = isHeadsUp
      ? this.dealerPosition
      : (this.dealerPosition + 3) % this.currentPlayersCount;

    // Set pivot (Last player to talk)
    // Pre-flop pivot is always the Big Blind
    this.lastPlayerPosition = bb.position;

    this.setUpPlayer();
  }

  setUpPlayer() {
    const availableChoices = ['FOLD'];
    if (!this.currentPlayer.isAllIn && !this.currentPlayer.isFolded) {
      if (this.highestBet > this.currentPlayer.bet) {
        availableChoices.push('CALL');
        if (this.highestBet < this.currentPlayer.chips) {
          availableChoices.push('RAISE');
        }
      } else {
        availableChoices.push('BET', 'CHECK');
      }
      this.currentPlayer.availableChoices = availableChoices;
      this.currentPlayer.state = 'TO_PLAY';
    }

    this.currentPlayer.isCurrentPlayer = true;
  }

  startNewRound() {
    this.highestBet = 0;
    this.players.forEach((p) => {
      p.bet = 0;
      p.isCurrentPlayer = false;
      p.availableChoices = null;
    });

    // Post-flop, SB acts first (unless heads-up, then BB acts first - which is also dealerPosition + 1)
    // Actually, post-flop action always starts with the first active player left of dealer.
    this.currentPlayerPosition = this.findNextActivePlayer(this.dealerPosition);

    // Pivot post-flop is the Dealer (last player to talk if everyone matches)
    this.lastPlayerPosition = this.dealerPosition;

    // If the dealer is not active (folded), find the first active player to their right
    if (this.players[this.lastPlayerPosition].isFolded) {
      this.lastPlayerPosition = this.findPreviousActivePlayer(
        this.lastPlayerPosition,
      );
    }

    this.setUpPlayer();
  }

  findNextActivePlayer(startPos: number): number {
    let nextPos = (startPos + 1) % this.currentPlayersCount;
    while (
      this.players[nextPos].isFolded ||
      this.players[nextPos].isAllIn ||
      this.players[nextPos].isAwaiting
    ) {
      if (nextPos === startPos) break; // Should not happen during active hand
      nextPos = (nextPos + 1) % this.currentPlayersCount;
    }
    return nextPos;
  }

  findPreviousActivePlayer(startPos: number): number {
    let prevPos =
      (startPos - 1 + this.currentPlayersCount) % this.currentPlayersCount;
    while (this.players[prevPos].isFolded || this.players[prevPos].isAwaiting) {
      if (prevPos === startPos) break;
      prevPos =
        (prevPos - 1 + this.currentPlayersCount) % this.currentPlayersCount;
    }
    return prevPos;
  }

  handleNextDealer() {
    Logger.log('Handling next dealer', 'Table');
    this.dealerPlayer.isDealer = false;
    this.dealerPosition =
      this.dealerPosition + 1 < this.currentPlayersCount
        ? this.dealerPosition + 1
        : 0;
    this.dealerPlayer.isDealer = true;
  }

  handleNextPlayer() {
    Logger.log('Moving turn to next player', 'Table');
    this.currentPlayer.isCurrentPlayer = false;
    this.currentPlayer.availableChoices = null;

    this.currentPlayerPosition = this.findNextActivePlayer(
      this.currentPlayerPosition,
    );

    Logger.debug(
      `Next player is ${this.currentPlayer.name} (pos: ${this.currentPlayerPosition})`,
      'Table',
    );

    this.setUpPlayer();
  }

  setLastPlayerToTalk() {
    Logger.log('Updating pivot point', 'Table');
    this.lastPlayerPosition = this.findPreviousActivePlayer(
      this.currentPlayerPosition,
    );
  }

  bet(amount: number) {
    const amountToBet = Math.min(this.currentPlayer.chips, amount);
    this.currentPlayer.payChips(amountToBet);
    this.pot += amountToBet;
    this.highestBet = this.currentPlayer.bet;
  }

  call() {
    const currentBet = this.currentPlayer.bet;
    const amountToCall = Math.min(
      this.highestBet - currentBet,
      this.currentPlayer.chips,
    );
    this.currentPlayer.payChips(amountToCall);
    this.pot += amountToCall;
  }

  raise(amount: number) {
    const currentBet = this.currentPlayer.bet;
    const amountToRaise = Math.min(
      this.highestBet - currentBet + amount,
      this.currentPlayer.chips,
    );
    this.pot += amountToRaise;
    this.currentPlayer.payChips(amountToRaise);
    this.highestBet = this.currentPlayer.bet;
  }

  fold() {
    this.currentPlayer.doFold();
  }

  check() {
    this.currentPlayer.doCheck();
  }

  handlePreFlop() {
    Logger.log('Transitioning to Flop round', 'Table');
    this.currentRound = HandRound.FLOP;
  }

  handleFlop() {
    this.currentRound = HandRound.FLOP;
    const cards = this.deck.dealFlop();
    this.communityCards.push(...cards);
    Logger.log(
      `Dealing Flop: ${cards
        .map((c) => c.rank + c.suit[0].toUpperCase())
        .join(', ')}`,
      'Table',
    );
    this.startNewRound();
  }
  handleTurn() {
    this.currentRound = HandRound.TURN;
    const card = this.deck.dealTurnOrRiver();
    this.communityCards.push(card);
    Logger.log(
      `Dealing Turn: ${card.rank}${card.suit[0].toUpperCase()}`,
      'Table',
    );
    this.startNewRound();
  }
  handleRiver() {
    this.currentRound = HandRound.RIVER;
    const card = this.deck.dealTurnOrRiver();
    this.communityCards.push(card);
    Logger.log(
      `Dealing River: ${card.rank}${card.suit[0].toUpperCase()}`,
      'Table',
    );
    this.startNewRound();
  }

  handleShowDown() {
    // here goes logic to understand wich is the winning hand
    Logger.log('Handling Showdown', 'Table');
    this.currentRound = HandRound.SHOWDOWN;
    const handsAndIds = this.players
      .filter((p) => !p.isFolded && !p.isAwaiting)
      .map((p) => {
        const handParsed = formatHand([...p.hand, ...this.communityCards]);
        const handSolved = Hand.solve(handParsed);
        Logger.log(
          `Player ${p.name} shows: ${p.hand
            ?.map((c) => c.rank + c.suit[0].toUpperCase())
            .join(', ')} (result: ${handSolved.descr})`,
          'Table',
        );
        return {
          id: p.id,
          name: p.name,
          hand: handSolved,
        };
      });

    const winners = Hand.winners(handsAndIds.map((h) => h.hand));

    // winners is an array of Hand objects
    const winnerDescriptions = winners.map((w) => w.descr).join(' and ');
    Logger.log(
      `Showdown Result: Winning hand(s) - ${winnerDescriptions}`,
      'Table',
    );

    const winnerPlayers = handsAndIds.filter((h) =>
      winners.some((w) => w.descr === h.hand.descr && w.name === h.hand.name),
    );

    const share = this.pot / winnerPlayers.length;
    winnerPlayers.forEach((wp) => {
      const player = this.players.find((p) => p.id === wp.id);
      player.chips += share;
      Logger.log(
        `${player.name} wins ${share} chips with ${wp.hand.descr}`,
        'Table',
      );
    });
    if (winnerPlayers.length > 0) {
      const firstWinner = this.players.find(
        (p) => p.id === winnerPlayers[0].id,
      );
      if (firstWinner) {
        this.currentPlayerPosition = firstWinner.position;
      }
    }

    this.isHandOver = true;
    this.players.forEach((p) => {
      p.isCurrentPlayer = false;
      p.availableChoices = [];
    });

    if (this.currentPlayer) {
      this.currentPlayer.isCurrentPlayer = true;
    }
  }
  handleWinWithoutShowDown() {
    // here goes logic to understand wich is the winning hand
    const winner = this.players.find((p) => !p.isFolded && !p.isAwaiting);
    if (winner) {
      Logger.log(
        `${winner.name} wins ${this.pot} chips (Opponents folded)`,
        'Table',
      );
      winner.chips += this.pot;
      this.currentPlayerPosition = winner.position;
    } else {
      Logger.warn('No winner found in handleWinWithoutShowDown', 'Table');
    }
    this.isHandOver = true;
    this.players.forEach((p) => {
      p.isCurrentPlayer = false;
      p.availableChoices = [];
    });
    if (this.currentPlayer) {
      this.currentPlayer.isCurrentPlayer = true;
    }
  }
}
