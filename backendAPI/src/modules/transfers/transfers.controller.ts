import { Body, Controller, Post } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  async create(@Body() dto: CreateTransferDto) {
    const result = await this.transfersService.create(dto);
    return { success: true, data: result };
  }
}
