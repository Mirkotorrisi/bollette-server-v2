import {
  Body,
  Controller,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AuthInterceptor } from 'src/interceptors/auth.interceptor';
import { SpinSlotWheelDto } from './dto/SpinSlotWheel.dto';
import { SlotService } from './slot.service';

@Controller('slot')
export class SlotController {
  constructor(private slotService: SlotService) {}

  @Post()
  @UseInterceptors(AuthInterceptor)
  spinSlotWheel(
    @Body() spinSlotWheelDto: SpinSlotWheelDto,
    @Request() req: any,
  ) {
    return this.slotService.spinSlotWheel(spinSlotWheelDto, req.user?.id);
  }
}
