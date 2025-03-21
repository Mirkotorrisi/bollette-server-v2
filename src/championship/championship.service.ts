import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { catchError, firstValueFrom } from 'rxjs';
import { ChampionshipEnum } from './dto/GetMatches.dto';
import {
  BETFLAG_HEADERS,
  BETFLAG_URL,
  getTeamPrefix,
  parseBetflagMatches,
  sport_keys,
  THE_ODDS_API_URL,
} from './utils';

@Injectable()
export class ChampionshipService {
  private readonly logger = new Logger('Championships Service');

  constructor(
    private readonly httpService: HttpService,
    @Inject('REDIS') private redis: RedisClientType,
  ) {}

  async getMatches(sport: ChampionshipEnum, avoidCache?: boolean) {
    this.logger.log('Get Matches');
    const cached = await this.redis.get(sport);

    if (cached && !avoidCache) {
      this.redis.set('bet_list_eternal', cached);
      return JSON.parse(cached);
    }

    let availableBetList;
    if (sport === 'serie_a') {
      availableBetList = await this.getBetflagMatches();
    } else {
      const res = await firstValueFrom(
        this.httpService
          .get(`${THE_ODDS_API_URL + sport_keys[sport]}/odds/`, {
            params: {
              apiKey: process.env.THE_ODDS_API_KEY,
              regions: 'eu',
              markets: 'h2h,totals',
            },
          })
          .pipe(
            catchError((err) => {
              this.logger.error('Something went wrong while fetching odds');
              throw new BadRequestException(err.response.data);
            }),
          ),
      );

      availableBetList = res.data.map(
        ({ home_team, away_team, bookmakers, commence_time, id }) => {
          const bookmaker = bookmakers?.find((b) => b.markets.length > 1);
          const h2h = bookmaker?.markets?.find((mkt) => mkt.key === 'h2h');

          const totals = bookmaker?.markets?.find(
            (mkt) => mkt.key === 'totals',
          );

          const home = h2h?.outcomes.find((o) => o.name === home_team)?.price;
          const away = h2h?.outcomes.find((o) => o.name === away_team)?.price;
          const draw = h2h?.outcomes.find((o) => o.name === 'Draw')?.price;
          const over = totals?.outcomes.find((o) => o.name === 'Over')?.price;
          const under = totals?.outcomes.find((o) => o.name === 'Under')?.price;
          const matchId = `${getTeamPrefix(home_team)}-${getTeamPrefix(
            away_team,
          )}${commence_time?.split('T')?.[0]}`;
          return {
            id,
            sport_key: sport,
            matchId,
            teams: [home_team, away_team],
            start: commence_time,
            odds: {
              home,
              draw,
              away,
              over,
              under,
            },
          };
        },
      );
    }

    this.redis.set(sport, JSON.stringify(availableBetList), {
      EX: 60,
    });
    this.redis.set('bet_list_eternal', JSON.stringify(availableBetList));
    return availableBetList;
  }

  async getAllMatches() {
    this.logger.log('Get All Matches!!!!');
    const tournaments = [];
    for (const sport in sport_keys) {
      const matches = await this.getMatches(sport as ChampionshipEnum);
      tournaments.push(...matches);
    }

    return tournaments.sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }

  async getBetflagMatches() {
    const data = await firstValueFrom(
      this.httpService
        .get(BETFLAG_URL, {
          headers: BETFLAG_HEADERS,
        })
        .pipe(
          catchError((err) => {
            this.logger.error('Something went wrong while fetching odds');
            throw new BadRequestException(err.response.data);
          }),
        ),
    );
    const parsed = parseBetflagMatches(data.data.leo);
    return parsed;
  }
}
