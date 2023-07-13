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
    console.log('isFull ', this.currentPlayersCount >= this.maxPlayers);
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
    console.log(
      'isLastPlayerToTalk',
      this.currentPlayerPosition === this.lastPlayerPosition,
    );
    return this.currentPlayerPosition === this.lastPlayerPosition;
  }

  get isTwoPlayerLeft(): boolean {
    console.log(
      'isTwoPlayerLeft',
      this.players.filter((p) => !p.isFolded).length === 2,
    );
    return this.players.filter((p) => !p.isFolded).length === 2;
  }

  get hasMoreThanOnePlayer(): boolean {
    console.log('hasMoreThanOnePlayer', this.players.length > 1);
    return this.players.length > 1;
  }

  get hasLeastOnePlayer(): boolean {
    console.log('hasLeastOnePlayer', !!this.players.length);
    return !!this.players.length;
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
    console.log('startNewHand');
    this.isHandOver = false;
    this.deck = new Deck();
    this.pot = 0;
    this.communityCards = [];
    this.currentPlayerPosition =
      (this.dealerPosition + 3) % this.currentPlayersCount;

    this.players.forEach((player, index) => {
      player.reset();
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

    this.setUpPlayer();
  }

  setUpPlayer() {
    const availableChoices = ['FOLD'];
    if (this.highestBet > this.currentPlayer.bet) {
      availableChoices.push('CALL', 'RAISE');
    } else {
      availableChoices.push('BET', 'CHECK');
    }
    this.currentPlayer.availableChoices = availableChoices;
    this.currentPlayer.state = 'TO_PLAY';
    this.currentPlayer.isCurrentPlayer = true;
  }

  startNewRound() {
    this.highestBet = 0;
    this.currentPlayer.isCurrentPlayer = false;
    this.currentPlayer.availableChoices = null;
    this.currentPlayerPosition =
      (this.dealerPosition + 1) % this.currentPlayersCount;
    this.players.forEach((p) => (p.bet = 0));
    this.setUpPlayer();
  }

  handleNextDealer() {
    console.log('handleNextDealer');
    this.dealerPlayer.isDealer = false;
    this.dealerPosition =
      this.dealerPosition + 1 < this.currentPlayersCount
        ? this.dealerPosition + 1
        : 0;
    this.dealerPlayer.isDealer = true;
  }

  handleNextPlayer() {
    console.log('handleNextPlayer');
    this.currentPlayer.isCurrentPlayer = false;
    this.currentPlayer.availableChoices = null;

    const isTheLastPlayer =
      this.currentPlayerPosition === this.players.length - 1;
    this.currentPlayerPosition = isTheLastPlayer
      ? 0
      : this.currentPlayerPosition + 1;

    if (
      this.players[this.currentPlayerPosition].isFolded ||
      this.players[this.currentPlayerPosition].isAllIn
    )
      this.handleNextPlayer();

    this.setUpPlayer();
  }

  setLastPlayerToTalk() {
    console.log('setLastPlayerToTalk');
    this.lastPlayerPosition =
      this.currentPlayerPosition - 1 >= 0
        ? this.currentPlayerPosition - 1
        : this.players.length - 1;

    if (
      this.players[this.lastPlayerPosition].isFolded ||
      this.players[this.lastPlayerPosition].isAllIn
    )
      this.setLastPlayerToTalk();
  }

  handleWin() {
    console.log('handleWin');
    this.currentPlayer.chips += this.pot;
    this.isHandOver = true;
  }

  bet(amount: number) {
    console.log('bet');
    const amountToBet = Math.min(this.currentPlayer.chips, amount);
    this.currentPlayer.payChips(amountToBet);
    this.pot += amountToBet;
    this.highestBet = this.currentPlayer.bet;
  }

  call() {
    console.log('call');
    const currentBet = this.currentPlayer.bet;
    const amountToCall = Math.min(
      this.highestBet - currentBet,
      this.currentPlayer.chips,
    );
    this.currentPlayer.payChips(amountToCall);
    this.pot += amountToCall;
  }

  raise(amount: number) {
    console.log('raise');
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
    console.log('fold');
    this.currentPlayer.doFold();
  }

  check() {
    console.log('checks');
  }

  handlePreFlop() {
    console.log('handlePreFlop');
    this.currentRound = HandRound.FLOP;
  }

  handleFlop() {
    console.log('handleFlop');
    this.currentRound = HandRound.FLOP;
    this.communityCards.push(...this.deck.dealFlop());
    this.startNewRound();
  }
  handleTurn() {
    console.log('handleTurn');
    this.currentRound = HandRound.TURN;
    this.communityCards.push(this.deck.dealTurnOrRiver());
    this.startNewRound();
  }
  handleRiver() {
    console.log('handleRiver');
    this.currentRound = HandRound.RIVER;
    this.communityCards.push(this.deck.dealTurnOrRiver());
    this.startNewRound();
  }

  handleShowDown() {
    // here goes logic to understand wich is the winning hand
    console.log('handleShowDown');
  }
  handleWinWithoutShowDown() {
    // here goes logic to understand wich is the winning hand
    console.log('handleWinWithoutShowDown');
    const winner = this.players.find((p) => !p.isFolded);
    winner.chips += this.pot;
  }
}
