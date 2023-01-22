import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { HttpService } from '@nestjs/axios';
import { sport_keys, THE_ODDS_API_URL, getTeamPrefix } from './utils';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ChampionshipService {
  private readonly logger = new Logger('Championships Service');

  constructor(
    private readonly httpService: HttpService,
    @Inject('REDIS') private redis: RedisClientType,
  ) {}

  async getMatches(sport: string, avoidCache?: boolean) {
    this.logger.log('Get Matches');
    const cached = await this.redis.get(sport);

    if (cached && !avoidCache) {
      this.redis.set('bet_list_eternal', cached);
      return JSON.parse(cached);
    }

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

    const availableBetList = res.data.map(
      ({ home_team, away_team, bookmakers, commence_time, id, sport_key }) => {
        const bookmaker = bookmakers?.find((b) => b.markets.length > 1);
        const h2h = bookmaker?.markets?.find((mkt) => mkt.key === 'h2h');
        const totals = bookmaker?.markets?.find((mkt) => mkt.key === 'totals');

        const home = h2h?.outcomes[0]?.price;
        const away = h2h?.outcomes[1]?.price;
        const draw = h2h?.outcomes[2]?.price;
        const over = totals?.outcomes[0]?.price;
        const under = totals?.outcomes[1]?.price;
        const matchId = `${getTeamPrefix(home_team)}-${getTeamPrefix(
          away_team,
        )}${commence_time?.split('T')?.[0]}`;
        return {
          id,
          sport_key,
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
    this.redis.set(sport, JSON.stringify(availableBetList), {
      EX: 60,
    });
    this.redis.set('bet_list_eternal', JSON.stringify(availableBetList));
    return availableBetList;
  }
}
