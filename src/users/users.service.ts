import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('Users Service');

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  findOne({
    email,
    username,
  }: {
    email: string;
    username: string;
  }): Promise<User> {
    this.logger.log('Find one user');
    return this.usersRepository.findOneBy([{ email }, { username }]);
  }

  async getUserInfo(userId: string): Promise<Omit<User, 'password'>> {
    this.logger.log('Get account sum');
    const user = await this.usersRepository.findOneBy({ id: +userId });
    if (!user) throw new BadRequestException('Invalid id');
    delete user.password;
    return user;
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    this.logger.log('Get user tickets');
    const allRawBetTickets = await this.ticketRepository.query(
      `SELECT team_1,team_2,result,odd,bet.ticket_id,commence_time,bet.status AS bet_status, bolletta.status AS bolletta_status,import AS bet_import,max_win, insert_time FROM (bet INNER JOIN bolletta) WHERE bet.ticket_id = bolletta.ticket_id AND bolletta.user_id =${userId} ORDER BY insert_time DESC;`,
    );
    const tickets = allRawBetTickets.reduce((acc, curr) => {
      const foundTicket = acc.find((t) => t.ticket_id === curr.ticket_id);
      const {
        ticket_id,
        bolletta_status,
        bet_import,
        max_win,
        insert_time,
        ...betTicket
      } = curr;

      if (foundTicket) {
        foundTicket.tickets.push(betTicket);
        return acc;
      } else {
        return [
          ...acc,
          {
            ticket_id,
            bolletta_status,
            bet_import,
            max_win,
            insert_time,
            tickets: [betTicket],
          },
        ];
      }
    }, []);
    return tickets;
  }

  async decrementUserBalance(userId: string, betImport: number) {
    this.logger.log(`Bet charged to ${userId}import ${betImport}`);
    const { account_sum } = await this.getUserInfo(userId);
    if (account_sum < betImport)
      throw new HttpException(
        `Your balance is not enough to place this bet (${account_sum}$)`,
        402,
      );
    await this.usersRepository.query(
      `UPDATE users SET account_sum = account_sum - ${betImport} WHERE (id = ${userId})`,
    );
    return account_sum - betImport;
  }

  async incrementUserBalance(userId: string, winImport: number) {
    this.logger.log(`Win accredited to ${userId}import ${winImport}`);
    await this.usersRepository.query(
      `UPDATE users SET account_sum = account_sum + ${winImport} WHERE (id = ${userId})`,
    );
  }

  createOne({ username, email, password }: Partial<User>) {
    return this.usersRepository.insert({ username, email, password });
  }
}
