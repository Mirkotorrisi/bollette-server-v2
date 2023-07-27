import { Card } from './types';

const rankToLetter = {
  14: 'A',
  13: 'K',
  12: 'Q',
  11: 'J',
  10: 'T',
};

const formatCard = (card: Card) =>
  `${rankToLetter[card.rank] ?? card.rank}${card.suit.charAt(0)}`;

export const formatHand = (hand: Card[]) => hand.map(formatCard);
