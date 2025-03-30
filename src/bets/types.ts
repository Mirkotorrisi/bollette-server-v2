export type TicketMatch = {
  teams: string[];
  matchId: string;
  start: string;
  result: ResultType;
  odd: number;
  won: boolean;
};

export const results = [
  'home',
  'draw',
  'away',
  'under',
  'over',
  'gg',
  'ng',
] as const;

export type ResultType = (typeof results)[number];
