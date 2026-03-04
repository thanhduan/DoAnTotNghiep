
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer } from './transfers.schema';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { EventsGateway } from '../../common/gateways/events.gateway';

@Injectable()
export class TransfersService {
  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<Transfer>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createTransferDto: CreateTransferDto): Promise<Transfer> {
    const created = new this.transferModel({
      ...createTransferDto
    });
    const result = await created.save();
    // Emit websocket event
    this.eventsGateway.server.emit('transfer:created', result);
    return result;
  }
}
