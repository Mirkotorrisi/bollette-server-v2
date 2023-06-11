import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TableAmountGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const data = context.switchToWs().getData();
    const hasPlayerAndAmount = data?.tableId && data.amount;
    if (!hasPlayerAndAmount) {
      throw new BadRequestException('Table id or amount is missing');
    }
    return hasPlayerAndAmount;
  }
}
