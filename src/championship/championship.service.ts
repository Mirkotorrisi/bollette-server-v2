import { ChampionshipDto, MktDto } from './dto/GetMatches.dto';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
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

  async getMatches(sport: string, markets: string) {
    this.logger.log('Get Matches');
    const cached = await this.redis.get('bet_list_temp');

    if (cached) return JSON.parse(cached);

    const res = await firstValueFrom(
      this.httpService
        .get(`${THE_ODDS_API_URL + sport_keys[sport]}/odds/`, {
          params: {
            apiKey: process.env.THE_ODDS_API_KEY,
            regions: 'eu',
            markets,
          },
        })
        .pipe(
          catchError((err) => {
            this.logger.error('Something went wrong while fetching odds');
            throw new InternalServerErrorException(err.response.data);
          }),
        ),
    );

    const availableBetList = res.data.map(
      ({ home_team, away_team, bookmakers, commence_time }) => {
        const home = bookmakers[0]?.markets[0]?.outcomes[0]?.price;
        const away = bookmakers[0]?.markets[0]?.outcomes[1]?.price;
        const draw = bookmakers[0]?.markets[0]?.outcomes[2]?.price;
        const matchId = `${getTeamPrefix(home_team)}-${getTeamPrefix(
          away_team,
        )}${commence_time?.split('T')?.[0]}`;
        return {
          matchId,
          teams: [home_team, away_team],
          start: commence_time,
          odds: {
            home,
            draw,
            away,
            over: home,
            under: away,
          },
        };
      },
    );
    this.redis.set('bet_list_temp', JSON.stringify(availableBetList), {
      EX: 6000000000,
    });
    this.redis.set('bet_list_eternal', JSON.stringify(availableBetList));
    return availableBetList;
  }
}
