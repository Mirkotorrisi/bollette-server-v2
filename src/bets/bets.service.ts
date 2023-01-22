import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from '@redis/client';
import { ChampionshipService } from 'src/championship/championship.service';
import { Bet } from 'src/entities/bet.entity';
import { Ticket } from 'src/entities/ticket.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { BetDto, SubmitCheckoutDto } from './dto/SubmitCheckout.dto';

@Injectable()
export class BetsService {
  private readonly logger = new Logger('Bet Service');
  constructor(
    @InjectRepository(Bet)
    private betRepository: Repository<Bet>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private userService: UsersService,
    private championshipService: ChampionshipService,
    @Inject('REDIS') private redis: RedisClientType,
  ) {}

  getMultiplier = (ticket: BetDto[]) => {
    let res = 1;
    ticket.map((item: BetDto) => {
      res *= item.odd;
    });
    return res;
  };

  async submitCheckout(
    { betImport, ticket }: SubmitCheckoutDto,
    userId: string,
  ) {
    const ticket_id = Number(new Date().getTime().toString().substring(8));
    // CHECK IF ODDS ARE CHANGED
    const championships = Array.from(
      new Set(ticket.map((bet) => bet.sport_key)),
    );
    const flatList = await Promise.all(
      championships.flatMap(
        async (sport_key) =>
          await this.championshipService.getMatches(sport_key, true),
      ),
    );
    const updatedTicket = ticket.map((bet: BetDto) => {
      const matchOnList = flatList.find((m) => m.id === bet.id);
      if (!matchOnList)
        throw new BadRequestException(
          'Some bets are expired, create another ticket',
        );
      if (matchOnList.odds[bet.result] !== bet.odd) {
        return {
          ...bet,
          odd: matchOnList.odds[bet.result],
          prevOdd: bet.odd,
        };
      }
      return bet;
    });

    const multiplier = updatedTicket.reduce((acc, bet) => (acc *= bet.odd), 1);
    const hasSomeChanges = updatedTicket.some(
      (b) => !!b.prevOdd && b.prevOdd !== b.odd,
    );

    if (hasSomeChanges) {
      return {
        import: betImport,
        multiplier,
        updatedTicket,
        ticket_id,
      };
    }
    // STORE BOLLETTA ON DB AND UPDATE USER BALANCE
    const account_sum = await this.userService.decrementUserBalance(
      userId,
      betImport,
    );
    const maxWin = (multiplier * betImport).toFixed(2);

    await this.ticketRepository.query(
      `INSERT into bolletta (ticket_id, import, max_win, user_id) VALUES ('${ticket_id}', '${betImport}', '${maxWin}','${userId}');`,
    );

    const valuesToInsert = updatedTicket.map(
      ({ teams, odd, result, start, matchId }: BetDto) => [
        teams[0],
        teams[1],
        result,
        odd.toString(),
        ticket_id,
        start.replace('T', ' '),
        matchId,
      ],
    );
    await this.betRepository.query(
      `INSERT INTO bet (team_1, team_2, result, odd, ticket_id, commence_time, matchId) VALUES ?`,
      [valuesToInsert],
    );

    return {
      import: betImport,
      multiplier,
      maxWin,
      ticket_id,
      account_sum,
    };
  }
}
