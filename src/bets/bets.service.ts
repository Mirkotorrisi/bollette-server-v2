import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from '@redis/client';
import { Bet } from 'src/entities/bet.entity';
import { Ticket } from 'src/entities/ticket.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { PlaceBetDto } from './dto/PlaceBet.dto';
import { RemoveBetDto } from './dto/RemoveBet.dto';
import { SubmitCheckoutDto } from './dto/SubmitCheckout.dto';
import { TicketMatch } from './types';

@Injectable()
export class BetsService {
  private readonly logger = new Logger('Bet Service');
  constructor(
    @InjectRepository(Bet)
    private betRepository: Repository<Bet>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private userService: UsersService,
    @Inject('REDIS') private redis: RedisClientType,
  ) {}

  getMultiplier = (ticket: TicketMatch[]) => {
    let res = 1;
    ticket.map((item: TicketMatch) => {
      res *= item.odd;
    });
    return res;
  };

  async placeBet({ matchId, result, ticket_id }: PlaceBetDto) {
    this.logger.log('Place Bet');
    const raw = await this.redis.get('bet_list_eternal');
    if (!raw)
      throw new InternalServerErrorException(
        'Something went wrong while fetching odds',
      );
    const oddsList = JSON.parse(raw);
    const match = oddsList.find(
      (match: TicketMatch) => match.matchId === matchId,
    );

    const ticketId =
      ticket_id || Number(new Date().getTime().toString().substring(8));

    const rawTicket = await this.redis.get(`ticket${ticket_id}`);

    const ticket = rawTicket ? JSON.parse(rawTicket) : [];

    if (!match || !match.odds[result])
      throw new BadRequestException('Invalid odd or match Id');

    const filteredTicket = ticket.filter(
      (match: TicketMatch) => match.matchId !== matchId,
    );
    filteredTicket.push({
      matchId: match.matchId,
      teams: match.teams,
      start: match.start,
      result,
      odd: match.odds[result],
      won: false,
    });

    await this.redis.set(`ticket${ticketId}`, JSON.stringify(filteredTicket), {
      EX: 600,
    });
    return {
      ticket: filteredTicket,
      checkout: {
        ticket_id: ticketId,
        multiplier: this.getMultiplier(filteredTicket),
      },
    };
  }

  async removeBet({ matchId, ticket_id }: RemoveBetDto) {
    this.logger.log('Remove bet');
    const ticket = await this.redis.get(`ticket${ticket_id}`);
    if (!ticket) throw new NotFoundException('Ticket not found: ' + ticket_id);
    const updatedTicket = JSON.parse(ticket).filter(
      (match: TicketMatch) => match.matchId !== matchId,
    );
    await this.redis.set(`ticket${ticket_id}`, JSON.stringify(updatedTicket), {
      EX: 600,
    });
    return {
      ticket: updatedTicket,
      checkout: {
        ticket_id,
        multiplier: this.getMultiplier(updatedTicket),
      },
    };
  }

  async submitCheckout(
    { betImport }: SubmitCheckoutDto,
    ticket_id: string,
    userId: string,
  ) {
    const ticket = await this.redis.get(`ticket${ticket_id}`);
    if (!ticket)
      throw new NotFoundException('No ticket found with the provided id');
    const multiplier = this.getMultiplier(JSON.parse(ticket));
    const maxWin = (multiplier * betImport).toFixed(2);
    const account_sum = await this.userService.decrementUserBalance(
      userId,
      betImport,
    );

    await this.ticketRepository.query(
      `INSERT into bolletta (ticket_id, import, max_win, user_id) VALUES ('${ticket_id}', '${betImport}', '${maxWin}','${userId}');`,
    );

    const valuesToInsert = JSON.parse(ticket).map(
      ({ teams, odd, result, start, matchId }: TicketMatch) => [
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
