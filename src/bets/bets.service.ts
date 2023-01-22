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
import { BetDto, SubmitCheckoutDto } from './dto/SubmitCheckout.dto';
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

  getMultiplier = (ticket: BetDto[]) => {
    let res = 1;
    ticket.map((item: BetDto) => {
      res *= item.odd;
    });
    return res;
  };

  async submitCheckout(
    { betImport, ticket, multiplier }: SubmitCheckoutDto,
    userId: string,
  ) {
    const newMultiplier = this.getMultiplier(ticket);
    const maxWin = (multiplier * betImport).toFixed(2);
    const account_sum = await this.userService.decrementUserBalance(
      userId,
      betImport,
    );
    const ticket_id = Number(new Date().getTime().toString().substring(8));
    await this.ticketRepository.query(
      `INSERT into bolletta (ticket_id, import, max_win, user_id) VALUES ('${ticket_id}', '${betImport}', '${maxWin}','${userId}');`,
    );

    const valuesToInsert = ticket.map(
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
