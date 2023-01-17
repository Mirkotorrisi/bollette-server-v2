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

  @Post()
  @ApiOperation({
    summary:
      'Place a bet, no need for auth. If not ticket id is provided, a new one will be created',
  })
  placeBet(@Body() placeBetDto: PlaceBetDto) {
    return this.betsService.placeBet(placeBetDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Remove a bet from the ticket, need a ticket id',
  })
  removeBet(@Body() removeBetDto: RemoveBetDto) {
    return this.betsService.removeBet(removeBetDto);
  }

  @Post('checkout/:ticket_id')
  @ApiHeader({
    name: 'x-auth-token',
  })
  @ApiOperation({
    summary: 'Stores ticket on db, needs authentication',
  })
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
