import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOne({
    email,
    username,
  }: {
    email: string;
    username: string;
  }): Promise<User> {
    return this.usersRepository.findOneBy({ email, username });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  createOne({ username, email, password }: Partial<User>) {
    return this.usersRepository.insert({ username, email, password });
  }
}
