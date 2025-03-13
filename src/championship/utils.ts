import { BetflagMarkets } from './types';

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
} as const;

export const mkts = ['h2h', 'totals'];

export const THE_ODDS_API_URL = 'https://api.the-odds-api.com/v4/sports/';
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
