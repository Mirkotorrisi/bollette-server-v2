export const sport_keys = {
  premier_league: 'soccer_epl',
  serie_a: 'soccer_italy_serie_a',
  serie_b: 'soccer_italy_serie_b',
  ligamax: 'soccer_mexico_ligamx',
  bundesliga: 'soccer_germany_bundesliga',
  eredivisie: 'soccer_netherlands_eredivisie',
  primeira_liga: 'soccer_portugal_primeira_liga',
  la_liga: 'soccer_spain_la_liga',
  ligue_one: 'soccer_france_ligue_one',
  champions_league: 'soccer_uefa_champs_league',
  europa_league: 'soccer_uefa_europa_league',
};

export const mkts = ['h2h', 'totals'];

export const THE_ODDS_API_URL = 'https://api.the-odds-api.com/v4/sports/';
export const RESULTS_API_URL =
  'https://bollette-server-55622294482.europe-west1.run.app';

export const formatTeamName = (name: string) => {
  [
    "'",
    'nazionale',
    'Calcio',
    'CA',
    'CF',
    'BC',
    'AC',
    'FC',
    'SSC',
    'and',
    '&',
    'AS',
    'SAD',
    'CP',
    'Lisbon',
    /[0-9]/g,
  ].map((toDel) => (name = name?.replace(toDel, '')));
  return name?.trim();
};
export const getTeamPrefix = (team) =>
  formatTeamName(team).substring(0, 3).toUpperCase();
