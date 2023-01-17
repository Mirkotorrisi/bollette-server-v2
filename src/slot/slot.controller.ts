import {
  Body,
  Controller,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthInterceptor } from 'src/interceptors/auth.interceptor';
import { SpinSlotWheelDto } from './dto/SpinSlotWheel.dto';
import { SlotService } from './slot.service';

@Controller('slot')
@ApiTags('SLOT')
export class SlotController {
  constructor(private slotService: SlotService) {}

  @Post()
  @ApiOperation({
    summary:
      'Given number of wheels and symbols, returns an array with randomic sequence, and updates user balance if win.',
  })
  @ApiHeader({
    name: 'x-auth-token',
  })
  @UseInterceptors(AuthInterceptor)
  spinSlotWheel(
    @Body() spinSlotWheelDto: SpinSlotWheelDto,
    @Request() req: any,
  ) {
    return this.slotService.spinSlotWheel(spinSlotWheelDto, req.user?.id);
  }
}
