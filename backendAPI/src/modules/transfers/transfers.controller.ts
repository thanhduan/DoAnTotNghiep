import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { EventsGateway } from '../../common/gateways/events.gateway';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('transfers')
export class TransfersController {
  constructor(
    private readonly transfersService: TransfersService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransferDto) {
    const result = await this.transfersService.create(dto);
    return { success: true, data: result };
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    const result = await this.transfersService.cancel(id);
    // Phát sự kiện WebSocket cho client khi transfer bị hủy
    this.eventsGateway.server.emit('transfer:cancelled', {
      transferId: id,
      data: result,
    });
    return { success: true, data: result };
  }
}
