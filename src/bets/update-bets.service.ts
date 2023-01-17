import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, catchError } from 'rxjs';
import { formatTeamName, RESULTS_API_URL } from 'src/championship/utils';
import { Bet } from 'src/entities/bet.entity';
import { Ticket } from 'src/entities/ticket.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class UpdateBetsService {
  private readonly logger = new Logger(UpdateBetsService.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Bet)
    private betRepository: Repository<Bet>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private userService: UsersService,
  ) {}
  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchResultsAndUpdateBets() {
    this.logger.debug('Calling external api to fetch matches results');
    const matchesResults = await firstValueFrom(
      this.httpService.get(RESULTS_API_URL).pipe(
        catchError((err) => {
          this.logger.error('Something went wrong while fetching results');
          throw new InternalServerErrorException(err.response.data);
        }),
      ),
    );
    this.logger.debug('Updating stored bets according to retrieved results');
    await Promise.all(
      matchesResults.data?.map(async (match) => {
        const team1 = formatTeamName(match.home);
        const team2 = formatTeamName(match.away);
        await this.betRepository.query(
          `UPDATE bet SET  status = (CASE WHEN (result = '${match.final_result}' OR result = '${match.total}') THEN 'won' ELSE 'lost' END) WHERE (status = 'ongoing' AND team_1 LIKE '%${team1}%'AND team_2 LIKE '%${team2}%');`,
        );
      }),
    );
    this.logger.debug('Updating stored tickets according to new updated bets');
    await this.ticketRepository.query(
      `UPDATE bolletta set status = (CASE WHEN (SELECT SUM(ticket_id) FROM bet WHERE bet.ticket_id = bolletta.ticket_id AND bet.status = 'lost') > 0 THEN 'lost' WHEN (SELECT SUM(ticket_id) FROM bet WHERE bet.ticket_id = bolletta.ticket_id) =(SELECT SUM(ticket_id) FROM bet WHERE (bet.ticket_id = bolletta.ticket_id AND bet.status = 'won')) THEN 'won' ELSE 'ongoing' END)`,
    );
    const won_tickets = await this.ticketRepository.query(
      `SELECT ticket_id,max_win,user_id FROM bolletta WHERE (status = 'won' AND paid=FALSE)`,
    );
    this.logger.debug(`Found ${won_tickets?.length} won tickets`);
    await Promise.all(
      won_tickets.map(async ({ ticket_id, max_win, user_id }) => {
        await this.userService.incrementUserBalance(user_id, max_win);
        await this.ticketRepository.query(
          `UPDATE bolletta set paid = TRUE WHERE ticket_id = ${ticket_id};`,
        );
      }),
    );
  }
}
