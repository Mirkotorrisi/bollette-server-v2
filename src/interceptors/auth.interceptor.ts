import { Observable } from 'rxjs';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(@Inject('REDIS') private redis: RedisClientType) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-auth-token'];
    console.log(token);
    if (!token) throw new UnauthorizedException('Auth token is missing');
    try {
      const verified = jwt.verify(token, process.env.JWT_KEY);
      const id = String(verified['id']);
      const res = await this.redis.get(id);
      if (res) {
        this.redis.set(id, token, { EX: 600 });
        req.user = verified;
        return next.handle();
      }
    } catch (error) {}
    throw new UnauthorizedException(
      'Session expired. Log in again to continue',
    );
  }
}
