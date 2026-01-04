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

// Format card for display to users (e.g., "3D" for Three of Diamonds)
export const formatCardForDisplay = (card: Card): string => {
  const rank = rankToLetter[card.rank] ?? card.rank.toString();
  const suit = card.suit.charAt(0).toUpperCase();
  return `${rank}${suit}`;
};

// Format multiple cards for display (e.g., "3D  4D  KH  AS  QH")
export const formatCardsForDisplay = (cards: Card[]): string => {
  return cards.map(formatCardForDisplay).join('  ');
};
