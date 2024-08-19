import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bet } from 'src/entities/bet.entity';
import { BetsModule } from './bets/bets.module';
import { ChampionshipModule } from './championship/championship.module';
import { Ticket } from './entities/ticket.entity';
import { User } from './entities/user.entity';
import { PokerModule } from './poker/poker.module';
import { RankingModule } from './ranking/ranking.module';
import { RedisModule } from './redis/redis.module';
import { SlotModule } from './slot/slot.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,
      password: process.env.MYSQL_PASSWORD,
      entities: [User, Ticket, Bet],
    }),
    RedisModule,
    BetsModule,
    ChampionshipModule,
    RankingModule,
    SlotModule,
    PokerModule,
  ],
})
export class AppModule {}
