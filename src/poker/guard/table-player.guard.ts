import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TablePlayerGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const data = context.switchToWs().getData();
    const hasPlayerAndTableId = data?.tableId && data.playerId;
    if (!hasPlayerAndTableId) {
      throw new BadRequestException('Table Id or PlayerId is missing');
    }
    return hasPlayerAndTableId;
  }
}
