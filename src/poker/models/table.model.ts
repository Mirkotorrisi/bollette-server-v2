import { Card, HandRound } from '../utils/types';
import { Deck } from './deck.model';
import { Player } from './player.model';

export class Table {
  dealerPosition = 0;
  currentRound = HandRound.PRE_FLOP;
  id: string;
  players: Player[] = [];
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
    return this.currentPlayersCount >= this.maxPlayers;
  }

  get dealerPlayer(): Player {
    return this.players.find((p) => p.position === this.dealerPosition);
  }

  get smallBlindPlayer(): Player {
    return this.players.find(
      (p) =>
        p.position === (this.dealerPosition + 1) % this.currentPlayersCount,
    );
  }

  get bigBlindPlayer(): Player {
    return this.players.find(
      (p) =>
        p.position === (this.dealerPosition + 2) % this.currentPlayersCount,
    );
  }

  get currentPlayer(): Player {
    return this.players.find((p) => p.position === this.currentPlayerPosition);
  }

  get isLastPlayerToTalk(): boolean {
    return this.currentPlayerPosition === this.lastPlayerPosition;
  }

  addPlayer(player: Player): boolean {
    if (this.isFull || this.players.some((p) => p.id === player.id)) {
      return false;
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
    console.log('TABLE STARTING NEW HAND');
    this.isHandOver = false;
    this.currentPlayerPosition =
      (this.dealerPosition + 3) % this.currentPlayersCount;

    this.players.forEach((player, index) => {
      player.hand = this.deck.dealTwoCards();
      player.position = index;
    });
    this.dealerPlayer.isDealer = true;
    // pay blinds
    this.smallBlindPlayer.chips -= this.smallBlind;

    this.smallBlindPlayer.bet += this.smallBlind;
    this.bigBlindPlayer.chips -= this.bigBlind;

    this.bigBlindPlayer.bet += this.bigBlind;
    this.highestBet = this.bigBlind;
    this.pot += this.smallBlind + this.bigBlind;

    const availableChoices = ['FOLD'];
    if (this.highestBet > this.currentPlayer.bet) {
      availableChoices.push('CALL', 'RAISE');
    } else {
      availableChoices.push('BET', 'CHECK');
    }

    this.currentPlayer.availableChoices = availableChoices;
    this.currentPlayer.state = 'TO_PLAY';
    this.currentPlayer.isCurrentPlayer = true;
    console.log(this);
  }

  handleNextDealer() {
    this.dealerPlayer.isDealer = false;
    this.dealerPosition =
      this.dealerPosition + 1 < this.currentPlayersCount
        ? this.dealerPosition + 1
        : 0;
    this.dealerPlayer.isDealer = true;
  }

  handleNextPlayer() {
    const isTheLastPlayer =
      this.currentPlayerPosition === this.players.length - 1;
    this.currentPlayerPosition = isTheLastPlayer
      ? 0
      : this.currentPlayerPosition + 1;

    if (this.players[this.currentPlayerPosition].isFolded)
      this.handleNextPlayer();

    const availableChoices = ['FOLD'];
    if (this.highestBet > this.currentPlayer.bet) {
      availableChoices.push('CALL', 'RAISE');
    } else {
      availableChoices.push('BET', 'CHECK');
    }

    this.currentPlayer.availableChoices = availableChoices;
    this.currentPlayer.isCurrentPlayer = true;
  }

  setLastPlayerToTalk() {
    this.lastPlayerPosition =
      this.currentPlayerPosition - 1 >= 0
        ? this.currentPlayerPosition - 1
        : this.players.length - 1;

    if (this.players[this.lastPlayerPosition].isFolded)
      this.setLastPlayerToTalk();
    console.log('setLastPlayerToTalk');
  }

  handleWin() {
    console.log(this, 'win');
    this.currentPlayer.chips += this.pot;
    this.isHandOver = true;
  }

  bet(amount: number) {
    console.log('TABLE bet');
    this.pot += amount;
    this.highestBet = amount;
    this.currentPlayer.doBet(amount);
  }

  call() {
    console.log('TABLE call');
    const currentBet = this.currentPlayer.bet;
    console.log(
      '🚀 ~ file: table.model.ts:165 ~ Table ~ call ~ this.currentPlayer:',
      this.currentPlayer.doCall,
    );
    const amountToCall = this.highestBet - currentBet;
    this.currentPlayer.doCall(amountToCall);
    this.pot += amountToCall;
  }

  raise(amount: number) {
    console.log('TABLE raise');
    const currentBet = this.currentPlayer.bet;
    const amountToRaise = this.highestBet - currentBet + amount;
    this.pot += amountToRaise;
    this.highestBet = this.currentPlayer.bet;
    this.currentPlayer.doRaise(amountToRaise);
  }

  fold() {
    console.log(this, 'fold');
    this.currentPlayer.doFold();
    console.log(this, 'fold');
    // this.handleNextStep();
  }

  check() {
    console.log(this, 'checks');
    // this.handleNextStep();
  }

  handleFlop() {
    console.log('HANDLE FLOP');
    this.currentRound = HandRound.FLOP;
    this.communityCards.push(...this.deck.dealFlop());
  }
  handleTurn() {
    console.log('HANDLE TURN', this);
    this.currentRound = HandRound.TURN;
    this.communityCards.push(this.deck.dealTurnOrRiver());
  }
  handleRiver() {
    console.log('HANDLE RIVER', this);
    this.currentRound = HandRound.RIVER;
    this.communityCards.push(this.deck.dealTurnOrRiver());
  }

  handleShowDown() {
    // here goes logic to understand wich is the winning hand
    console.log('SHOWDOWN', this);
  }
  handleWinWithoutShowDown() {
    // here goes logic to understand wich is the winning hand
    console.log('WIN WITHOUT SHOWDOWN', this);
  }
}
