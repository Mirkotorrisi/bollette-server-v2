import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthInterceptor } from 'src/interceptors/auth.interceptor';
import { RedisModule } from 'src/redis/redis.module';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Ticket } from 'src/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Ticket]),
    RedisModule,
  ],
  providers: [UsersService, AuthService, AuthInterceptor],
  controllers: [UsersController],
})
export class UsersModule {}
