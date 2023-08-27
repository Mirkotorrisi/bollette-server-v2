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
    this.availableChoices = [];
    this.isCurrentPlayer = false;
    this.isDealer = false;
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

  public payChips(amount: number) {
    if (this.chips >= amount) {
      this.chips -= amount;
      this.bet += amount;
      this.state = 'IDLE';
      console.log(this.name, 'pays Chips');
    }
    if (this.chips === 0) {
      this.state = 'ALL_IN';
      console.log(this.name, 'is All in');
    }
  }

  public canPay(amount: number) {
    return this.chips >= amount;
  }

  public doFold() {
    this.state = 'FOLD';
    this.bet = 0;
    console.log(this.name, 'does a fold');
  }

  public doCheck() {
    if (this.isAllIn) {
      console.log(this.name, ' automatic checks');
    } else {
      this.state = 'IDLE';
      console.log(this.name, ' checks');
    }
  }
}
