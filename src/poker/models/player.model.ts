import { Card } from '../utils/types';

export class Player {
  id: string;
  hand: Card[];
  chips: number;
  bet = 0;
  state: 'ALL_IN' | 'SIT_OUT' | 'FOLD' | 'TO_PLAY' | 'IDLE';
  name: string;
  isCurrentPlayer = false;
  isDealer = false;
  availableChoices: string[] = [];
  position: number;

  constructor(name: string, initialChips: number, id: string) {
    this.chips = initialChips;
    this.id = id;
    this.name = name;
  }

  public reset(): void {
    this.hand = [];
    this.bet = 0;
    this.state = 'IDLE';
  }

  get isFolded() {
    return this.state === 'FOLD';
  }
  get isAllIn() {
    return this.state === 'ALL_IN';
  }
  get isSitOut() {
    return this.state === 'SIT_OUT';
  }
  get hasToPlay() {
    return this.state === 'TO_PLAY';
  }

  public doBet(amount: number) {
    console.log(this, 'bet');
    this.chips -= amount;
    this.bet = amount;
    this.state = 'IDLE';
  }

  public doCall(amount: number) {
    this.chips -= amount;
    this.bet += amount;
    this.state = 'IDLE';

    console.log(this.name, ' does a call');
  }

  public doRaise(amount: number) {
    console.log(this, 'raise');
    this.chips -= amount;
    this.bet += amount;
    this.state = 'IDLE';
    console.log(this.name, 'does a raise');
  }

  public doFold() {
    this.state = 'FOLD';
    console.log(this.name, 'does a fold');
  }

  public doCheck() {
    console.log(this.name, ' checks');
    this.state = 'IDLE';
  }
}
