import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { User } from 'src/entities/user.entity';
import { RedisModule } from 'src/redis/redis.module';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';
import { AuthInterceptor } from 'src/interceptors/auth.interceptor';
import { UsersService } from 'src/users/users.service';
import { Bet } from 'src/entities/bet.entity';
import { UpdateBetsService } from './update-bets.service';
import { HttpModule } from '@nestjs/axios';
import { ChampionshipService } from 'src/championship/championship.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Ticket]),
    TypeOrmModule.forFeature([Bet]),
    TypeOrmModule.forFeature([User]),
    RedisModule,
    UsersModule,
  ],
  controllers: [BetsController],
  providers: [
    BetsService,
    AuthInterceptor,
    UsersService,
    UpdateBetsService,
    ChampionshipService,
  ],
})
export class BetsModule {}
