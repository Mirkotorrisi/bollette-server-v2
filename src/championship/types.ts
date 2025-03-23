export enum SIGN {
  HOME = 'home',
  VISITOR = 'away',
  DRAW = 'draw',
  OVER = 'over',
  UNDER = 'under',
}

export type Odds = {
  [key in SIGN]?: number;
};
export interface Match {
  id: string;
  matchId: string;
  teams: string[];
  start: string;
  odds: Odds;
}

export enum BetflagMarkets {
  FinalResult = '1350;7566;10654;0;0',
  OverUnder = '1350;7566;10655;0;0',
  DoubleChance = '1350;7566;10657;0;0',
  BothTeamsToScore = '1350;7566;10656;0;0',
  DrawNoBet = '1350;7566;10658;0;0',
}

export type SportGameOddsOdd = {
  oddID: string;
  opposingOddID: string;
  marketName: string;
  statID: string;
  statEntityID: string;
  periodID: string;
  betTypeID: string;
  sideID: string;
  started: boolean;
  ended: boolean;
  cancelled: boolean;
  bookOddsAvailable: boolean;
  fairOddsAvailable: boolean;
  fairOdds: string; // Es: "+110"
  bookOdds: string; // Es: "-104"
  openFairOdds: string;
  openBookOdds: string;
  scoringSupported: boolean;
};
