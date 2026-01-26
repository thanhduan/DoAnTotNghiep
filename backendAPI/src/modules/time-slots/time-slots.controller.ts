import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimeSlotsService } from './time-slots.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('time-slots')
@UseGuards(JwtAuthGuard)
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Get()
  async findAll(
    @Query('slotType') slotType?: 'OLDSLOT' | 'NEWSLOT',
    @Query('isActive') isActive?: string,
  ) {
    const slots = await this.timeSlotsService.findAll({
      slotType,
      isActive: isActive === 'false' ? false : true,
    });

    return {
      success: true,
      data: slots,
      total: slots.length,
    };
  }
}
