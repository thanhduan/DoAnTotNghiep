import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer } from './transfers.schema';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<Transfer>,
  ) {}

  async create(createTransferDto: CreateTransferDto): Promise<Transfer> {
    const created = new this.transferModel({
      ...createTransferDto
    });
    return created.save();
  }

  async cancel(id: string): Promise<Transfer> {
    const transfer = await this.transferModel.findById(id);
    if (!transfer) throw new NotFoundException('Transfer not found');
    if (transfer.status === 'cancelled') {
      throw new BadRequestException('Transfer request is already cancelled');
    }
    if (transfer.status === 'rejected') {
      throw new BadRequestException('Cannot cancel a rejected transfer request');
    }
    transfer.status = 'cancelled';
    transfer.cancelledAt = new Date();
    await transfer.save();
    return transfer;
  }
}
