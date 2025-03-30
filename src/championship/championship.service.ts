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
  getDateAfter,
  getDateBefore,
  getTeamPrefix,
  parseBetflagMatches,
  parseOdds,
  sport_keys,
  SPORTS_GAME_ODDS_API_URL,
} from './utils';

@Injectable()
export class ChampionshipService {
  private readonly logger = new Logger('Championships Service');

  constructor(
    private readonly httpService: HttpService,
    @Inject('REDIS') private redis: RedisClientType,
  ) {}

  async onModuleInit() {
    this.logger.log('Championships Service Initialized');
    // await this.getMatches(ChampionshipEnum.premier_league);
  }

  async getMatches(sport: ChampionshipEnum, avoidCache?: boolean) {
    this.logger.log('Get Matches');
    const cached = await this.redis.get(sport);

    if (cached && !avoidCache) {
      this.redis.set('bet_list_eternal', cached);
      return JSON.parse(cached);
    }

    const startsAfter = getDateAfter();
    const startsBefore = getDateBefore();
    const leagueID = sport_keys[sport];

    const res = await firstValueFrom(
      this.httpService
        .get(`${SPORTS_GAME_ODDS_API_URL}/events`, {
          params: {
            leagueID,
            startsAfter,
            startsBefore,
            bookmakerID: 'betfairexchange',
          },
          headers: {
            'x-api-key': process.env.SPORTS_GAME_ODDS_API_KEY,
            'Accept-Encoding': 'identity',
          },
        })
        .pipe(
          catchError((err) => {
            this.logger.error('Something went wrong while fetching odds');
            throw new BadRequestException(err.response.data);
          }),
        ),
    );

    const availableBetList = res.data.data.map(
      ({ odds, eventID, teams, status }) => {
        const homeTeamName = teams.home.names.long;
        const awayTeamName = teams.away.names.long;
        const matchId = `${getTeamPrefix(homeTeamName)}-${getTeamPrefix(
          awayTeamName,
        )}${status.startsAt?.split('T')?.[0]}`;
        return {
          id: eventID,
          sport_key: sport,
          matchId,
          teams: [homeTeamName, awayTeamName],
          start: status.startsAt,
          odds: parseOdds(odds),
        };
      },
    );

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
      try {
        const matches = await this.getMatches(sport as ChampionshipEnum);
        tournaments.push(...matches);
      } catch (error) {
        continue;
      }
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
