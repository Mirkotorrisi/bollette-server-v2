import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RankingService {
  private readonly logger = new Logger('Ranking Service');

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async getRanking() {
    return await this.usersRepository.query(
      'SELECT username, account_sum FROM users ORDER BY account_sum DESC',
    );
  }

  async getBestMultiplier() {
    return await this.ticketRepository.query(
      "SELECT bolletta.max_win, u.username FROM bolletta INNER JOIN (SELECT id, username FROM users) u ON u.id = bolletta.user_id WHERE status='won' ORDER BY max_win DESC",
    );
  }
}
