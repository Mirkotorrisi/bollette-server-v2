import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async register(email: string, username: string, password: string) {
    const user = await this.usersService.findOne({ email, username });
    if (user)
      throw new BadRequestException(
        'This email or username is already registered',
      );
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.has(password, salt);
    const insertResult = await this.usersService.createOne({
      username,
      email,
      password: hashed,
    });
    console.log(
      '🚀 ~ file: auth.service.ts:21 ~ AuthService ~ register ~ insertResult',
      insertResult,
    );
    // const token = generateAuthToken({ id: insertResult.identifiers., username });
  }
}
