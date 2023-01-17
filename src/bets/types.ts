export type TicketMatch = {
  teams: string[];
  matchId: string;
  start: string;
  result: ResultType;
  odd: number;
  won: boolean;
};

export type ResultType = 'home' | 'draw' | 'away' | 'under' | 'over';
