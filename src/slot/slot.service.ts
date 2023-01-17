import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SpinSlotWheelDto } from './dto/SpinSlotWheel.dto';

@Injectable()
export class SlotService {
  private readonly logger = new Logger('Slot Service');

  constructor(private usersService: UsersService) {}

  async spinSlotWheel(
    { numOfWheels, numOfSymbols, betImport }: SpinSlotWheelDto,
    userId: string,
  ) {
    this.logger.log('Spin slot wheel');
    await this.usersService.decrementUserBalance(userId, betImport);
    const results = Array.from({ length: numOfWheels }, () =>
      Math.floor(Math.random() * numOfSymbols),
    );
    const values = results.map((i) => i % numOfSymbols);
    let duplicates = values.filter(
      (item, index) => values.indexOf(item) != index,
    );
    if (duplicates.length > 0) {
      const points = [-100, 1, 5, 10, 5, 5, 5, 50, 10, 7, 5];
      const sum =
        duplicates.length === numOfWheels - 1
          ? points[duplicates[0]] ** numOfWheels
          : points[duplicates[0]] * (duplicates.length + 1);
      await this.usersService.incrementUserBalance(userId, sum);
      return {
        results,
        duplicates,
        sum,
      };
    }
    return {
      results,
      duplicates,
    };
  }
}
