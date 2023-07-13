import { CreateUserDto } from './dto/CreateUser.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import { RedisClientType } from '@redis/client';
import { LoginDto } from './dto/LogIn.dto';
import { LogoutDto } from './dto/Logout.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth Service');
  constructor(
    private usersService: UsersService,
    @Inject('REDIS') private redis: RedisClientType,
  ) {}

  generateAuthToken = ({ id, username, email, account_sum }: Partial<User>) =>
    jwt.sign({ id, username, email, account_sum }, process.env.JWT_KEY);

  async register({ email, username, password }: CreateUserDto) {
    this.logger.log('Register user');
    const user = await this.usersService.findOne({ email, username });
    if (user)
      throw new BadRequestException(
        'This email or username is already registered',
      );
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const insertResult = await this.usersService.createOne({
      username,
      email,
      password: hashed,
    });
    const id = insertResult.raw.insertId;
    const token = this.generateAuthToken({
      id,
      username,
    });
    await this.redis.set(String(id), token, { EX: 600 });
    return {
      user: { email, username, id, account_sum: 100 },
      token,
    };
  }

  async login({ usernameOrEmail, password }: LoginDto) {
    this.logger.log('Login user ');
    const user = await this.usersService.findOne({
      email: usernameOrEmail,
      username: usernameOrEmail,
    });
    const validatePass = await bcrypt.compare(password, user?.password ?? '');
    if (validatePass) {
      const { password, ...userToSend } = user;
      const token = this.generateAuthToken(userToSend);
      await this.redis.set(String(user.id), token, { EX: 600 });
      return {
        user: userToSend,
        token,
      };
    }
    throw new BadRequestException('Invalid email/username or password');
  }

  async logout({ id }: LogoutDto) {
    this.logger.log('Logout user ', new Date());
    await this.redis.del(String(id));
    return 'Successfully logged out';
  }
}
