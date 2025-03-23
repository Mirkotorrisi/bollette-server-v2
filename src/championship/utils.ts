import { BetflagMarkets, SportGameOddsOdd } from './types';

export const sport_keys = {
  premier_league: 'EPL',
  serie_a: 'IT_SERIE_A',
  serie_b: 'soccer_italy_serie_b',
  ligamax: 'LIGA_MX',
  bundesliga: 'BUNDESLIGA',
  eredivisie: 'soccer_netherlands_eredivisie',
  primeira_liga: 'soccer_portugal_primeira_liga',
  la_liga: 'LA_LIGA',
  ligue_one: 'FR_LIGUE_1',
  champions_league: 'UEFA_CHAMPIONS_LEAGUE',
  europa_league: 'UEFA_EUROPA_LEAGUE',
} as const;

export const mkts = ['h2h', 'totals'];

export const THE_ODDS_API_URL = 'https://api.the-odds-api.com/v4/sports/';
export const SPORTS_GAME_ODDS_API_URL = 'https://api.sportsgameodds.com/v2';

export const RESULTS_API_URL =
  'https://soccer-results-scraper-55622294482.europe-west1.run.app';

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
    ' ',
    /[0-9]/g,
  ].map((toDel) => (name = name?.replace(toDel, '')));
  return name?.trim();
};
export const getTeamPrefix = (team) =>
  formatTeamName(team).substring(0, 3).toUpperCase();

export const BETFLAG_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Accept-Language': 'it-IT,it;q=0.9',
  'Cache-Control': 'no-cache',
  Origin: 'https://www.betflag.it',
  Pragma: 'no-cache',
  Priority: 'u=1, i',
  Referer: 'https://www.betflag.it/',
  'Sec-Ch-Ua':
    '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"macOS"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  'X-Api-Version': '1.0',
  'X-Auth-Token': '',
  'X-Brand': '3',
  'X-Idcanale': '1',
};

export const BETFLAG_URL =
  'https://sportservice.betflag.it/api/sport/pregame/getOverviewEvents/0/0/93/1350/7566/0-93?channelId=1';

export const parseBetflagMatches = (matches: any[]) =>
  matches.map((match) => {
    const teams = match.teams.map((t) => t.nm);

    const [home, draw, away] = parseMarket(
      match.mmkW,
      BetflagMarkets.FinalResult,
      '0.0',
    );
    const [under, over] = parseMarket(
      match.mmkW,
      BetflagMarkets.OverUnder,
      '2.5',
    );

    const [homeDraw, homeAway, awayDraw] = parseMarket(
      match.mmkW,
      BetflagMarkets.DoubleChance,
      '0.0',
    );

    const [homeDrawNoBet, awayDrawNoBet] = parseMarket(
      match.mmkW,
      BetflagMarkets.DrawNoBet,
      '0.0',
    );

    return {
      teams,
      matchId: match.pi,
      start: match.ed,
      odds: {
        home,
        draw,
        away,
        over,
        under,
        homeDraw,
        homeAway,
        awayDraw,
        homeDrawNoBet,
        awayDrawNoBet,
      },
    };
  });

export const parseMarket = (
  markets: any,
  key: BetflagMarkets,
  spread: string,
) => markets[key].spd[spread].asl.map((sign) => sign.ov);

export const getDateAfter = () => new Date().toISOString().split('T')[0];
export const getDateBefore = () =>
  new Date(new Date().setDate(new Date().getDate() + 14))
    .toISOString()
    .split('T')[0];

export const outcomeKeys = {
  'points-away-reg-ml3way-away': 'away',
  'points-home-reg-ml3way-home': 'home',
  'points-all-reg-ml3way-draw': 'draw',
  'points-all-game-ou-under': 'under',
  'points-all-game-ou-over': 'over',
  'bothTeamsScored-all-game-yn-yes': 'gg',
  'bothTeamsScored-all-game-yn-no': 'ng',
} as const;

export const parseOdds = (odds: Record<string, SportGameOddsOdd>) => {
  const parsed: Record<string, number> = {};
  for (const key in outcomeKeys) {
    const odd = odds[key];
    if (!odd) continue;
    const value = getEuropeanOdd(Number(odd?.bookOdds));
    parsed[outcomeKeys[key]] = value;
  }
  return parsed;
};

export const getEuropeanOdd = (odd: number) => {
  if (odd > 0) return parseFloat((odd / 100 + 1).toFixed(2));
  return parseFloat((1 + 100 / Math.abs(odd)).toFixed(2));
};
