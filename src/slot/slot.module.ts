import { RedisModule } from 'src/redis/redis.module';
import { Module } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { AuthInterceptor } from 'src/interceptors/auth.interceptor';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Ticket } from 'src/entities/ticket.entity';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Ticket]),
  ],
  controllers: [SlotController],
  providers: [SlotService, AuthInterceptor, UsersService],
})
export class SlotModule {}
