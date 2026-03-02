import { Injectable } from '@nestjs/common';
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
}
