import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { PlaceBetDto } from './dto/PlaceBet.dto';
import { RemoveBetDto } from './dto/RemoveBet.dto';
import { SubmitCheckoutDto } from './dto/SubmitCheckout.dto';
import { AuthInterceptor } from 'src/interceptors/auth.interceptor';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('bets')
@ApiTags('BETS')
export class BetsController {
  constructor(private betsService: BetsService) {}

  @Post('checkout')
  @ApiHeader({
    name: 'x-auth-token',
  })
  @ApiOperation({
    summary: 'Stores ticket on db, needs authentication',
  })
  @UseInterceptors(AuthInterceptor)
  submitCheckout(
    @Body() submitCheckoutDto: SubmitCheckoutDto,
    @Request() req: any,
  ) {
    return this.betsService.submitCheckout(submitCheckoutDto, req.user?.id);
  }
}
