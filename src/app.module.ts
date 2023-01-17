import { Bet } from 'src/entities/bet.entity';
import { Ticket } from './entities/ticket.entity';
import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { RedisModule } from './redis/redis.module';
import { BetsModule } from './bets/bets.module';
import { ChampionshipModule } from './championship/championship.module';
import { RankingModule } from './ranking/ranking.module';
import { SlotModule } from './slot/slot.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    UsersModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Ticket, Bet],
    }),
    RedisModule,
    BetsModule,
    ChampionshipModule,
    RankingModule,
    SlotModule,
  ],
})
export class AppModule {}
