import { Card, Suit } from '../utils/types';

export class Deck {
  private deck: Card[];

  constructor() {
    this.shuffleDeck();
  }

  private shuffleDeck() {
    // Create an ordered deck of cards
    this.deck = [];

    for (const suit of [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds]) {
      for (let rank = 2; rank <= 14; rank++) {
        this.deck.push({ suit, rank });
      }
    }

    // Shuffle the deck using Fisher-Yates algorithm
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealTwoCards() {
    return [this.deck.pop(), this.deck.pop()];
  }

  dealFlop() {
    const flop: Card[] = [];
    // Remove the top card from the deck
    this.deck.pop();
    // Deal the flop (the next three cards)
    for (let i = 0; i < 3; i++) {
      flop.push(this.deck.pop());
    }
    return flop;
  }

  dealTurnOrRiver() {
    // Remove the top card from the deck
    this.deck.pop();
    // Deal the next card
    return this.deck.pop() as Card;
  }

  getDeck() {
    return this.deck;
  }
}
