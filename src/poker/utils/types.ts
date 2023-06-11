export interface Card {
  suit: Suit;
  rank: Rank;
}

export enum Suit {
  Clubs = 'clubs',
  Diamonds = 'diamonds',
  Hearts = 'hearts',
  Spades = 'spades',
}

export enum Rank {
  Two = 2,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Ace,
}

export enum HandRound {
  PRE_FLOP = 'PRE_FLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
  SHOWDOWN = 'SHOWDOWN',
}

export interface PlayerStatus {
  isPlaying: boolean;
  hasActed: boolean;
  isAllIn: boolean;
  isFolded: boolean;
}

export enum Actions {
  BET = 'bet',
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  RAISE = 'raise',
  LEAVE = 'leave',
  JOIN = 'join',
  CREATE_TABLE = 'createTable',
  SET_PLAYER = 'setPlayer',
  GET_TABLE = 'table',
  ALL_TABLES = 'allTables',
  ALL_USER_TABLES = 'allUserTables',
}

export interface TableAndPlayer {
  tableId: string;
  playerId: string;
}

export interface TableAndAmount {
  tableId: string;
  amount: number;
}
