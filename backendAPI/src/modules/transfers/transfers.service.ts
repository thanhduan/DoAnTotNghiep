import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer } from '@/database/schemas/transfer.schema';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { EventsGateway } from '../../common/gateways/events.gateway';

@Injectable()
export class TransfersService {
  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<Transfer>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createTransferDto: CreateTransferDto, currentUser: any): Promise<Transfer> {
    const transferDate = createTransferDto.transferDate
      ? new Date(createTransferDto.transferDate)
      : undefined;

    const created = new this.transferModel({
      ...createTransferDto,
      transferDate,
      fromUserId: currentUser._id?.toString?.() || currentUser._id,
      campusId: currentUser.campusId?.toString?.() || currentUser.campusId,
      status: 'pending',
    });

    const result = await created.save();

    // Emit websocket event
    this.eventsGateway.server.emit('transfer:created', result);

    return result;
  }
}
