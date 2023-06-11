import { Hand } from 'pokersolver';

export const getHandsVinner = (hands: any[]) => {
  const parsedHands = hands.map((h) => Hand.solve(h));

  return Hand.winners(parsedHands).toString();
};
