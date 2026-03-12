import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
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

  async getSelfExistingBySourceSchedules(
    sourceScheduleIds: string[],
    currentUser: any,
  ): Promise<Record<string, any>> {
    const userId = currentUser._id?.toString?.() || currentUser._id;
    const campusId = currentUser.campusId?.toString?.() || currentUser.campusId;

    const normalizedSourceIds = Array.from(
      new Set((sourceScheduleIds || []).map((id) => String(id || '').trim()).filter(Boolean)),
    );

    if (!normalizedSourceIds.length) {
      return {};
    }

    const transfers = await this.transferModel
      .find({
        fromUserId: userId,
        campusId,
        fromScheduleId: { $in: normalizedSourceIds },
        status: { $in: ['pending', 'approved'] },
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return transfers.reduce(
      (acc, item: any) => {
        const sourceId = String(item?.fromScheduleId || '');
        if (!sourceId || acc[sourceId]) {
          return acc;
        }

        acc[sourceId] = item;
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  async cancel(id: string, currentUser: any): Promise<Transfer> {
    const transfer = await this.transferModel.findById(id);

    if (!transfer) throw new NotFoundException('Transfer not found');

    if (
      transfer.campusId?.toString() !== (currentUser.campusId?.toString?.() || currentUser.campusId)
    ) {
      throw new ForbiddenException('Transfer is not in your campus scope');
    }

    const isOwner = transfer.fromUserId?.toString() === (currentUser._id?.toString?.() || currentUser._id);
    if (!isOwner && currentUser.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only transfer owner or super admin can cancel transfer request');
    }

    if (transfer.status !== 'pending') {
      throw new BadRequestException('Only pending transfer requests can be cancelled');
    }

    transfer.status = 'cancelled';
    (transfer as any).cancelledAt = new Date();

    await transfer.save();

    this.eventsGateway.server.emit('transfer:cancelled', {
      transferId: transfer._id,
      data: transfer,
    });

    return transfer;
  }
}
