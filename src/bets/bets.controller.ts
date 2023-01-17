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

@Controller('bets')
export class BetsController {
  constructor(private betsService: BetsService) {}

  @Post()
  placeBet(@Body() placeBetDto: PlaceBetDto) {
    return this.betsService.placeBet(placeBetDto);
  }

  @Delete()
  removeBet(@Body() removeBetDto: RemoveBetDto) {
    return this.betsService.removeBet(removeBetDto);
  }

  @Post('checkout/:ticket_id')
  @UseInterceptors(AuthInterceptor)
  submitCheckout(
    @Param('ticket_id') ticket_id: string,
    @Body() submitCheckoutDto: SubmitCheckoutDto,
    @Request() req: any,
  ) {
    return this.betsService.submitCheckout(
      submitCheckoutDto,
      ticket_id,
      req.user.id,
    );
  }
}
