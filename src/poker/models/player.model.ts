import { Card } from '../utils/types';

export class Player {
  id: string;
  hand: Card[];
  bet = 0;
  state: 'ALL_IN' | 'SIT_OUT' | 'FOLD' | 'TO_PLAY' | 'IDLE' | 'WAITING';
  name: string;
  isCurrentPlayer = false;
  isDealer = false;
  availableChoices: string[] = [];
  position: number;
  isBot = false;

  chips: number;

  constructor(name: string, initialChips: number, id: string, isBot?: boolean) {
    this.chips = initialChips;
    this.id = id;
    this.name = name;
    this.isBot = isBot;
    this.state = 'WAITING';
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
    return this.state === 'ALL_IN' || (this.chips === 0 && this.bet > 0);
  }
  get isSitOut() {
    return this.state === 'SIT_OUT';
  }
  get hasToPlay() {
    return this.state === 'TO_PLAY';
  }
  get isAwaiting() {
    return this.state === 'WAITING';
  }

  public payChips(amount: number) {
    const amountToPay = Math.min(this.chips, amount);
    this.chips -= amountToPay;
    this.bet += amountToPay;
    if (this.chips === 0) {
      this.state = 'ALL_IN';
      console.log(this.name, `pays ${amountToPay} and is All in`);
    } else {
      this.state = 'IDLE';
      console.log(
        this.name,
        `pays ${amountToPay} Chips. Remaining: ${this.chips}`,
      );
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
