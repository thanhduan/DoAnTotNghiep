import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Locker } from '@/database/schemas/locker.schema';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';

@Injectable()
export class LockerService {
  constructor(
    @InjectModel(Locker.name)
    private readonly lockerModel: Model<Locker>,

    @InjectModel('Campus')
    private readonly campusModel: Model<any>,
  ) { }

  /* =========================
        HELPERS
  ========================= */

  private async validateCampusId(campusId: string) {
    if (!Types.ObjectId.isValid(campusId)) {
      throw new BadRequestException('Invalid campusId');
    }

    const exists = await this.campusModel.exists({ _id: campusId });
    if (!exists) throw new NotFoundException('Campus not found');
  }

  private mapResponse(item: any) {
    const campus = item.campusId;

    return {
      id: item._id.toString(),
      lockerNumber: item.lockerNumber,
      position: item.position,
      deviceId: item.deviceId ?? null,
      status: item.status,
      batteryLevel: item.batteryLevel,
      isActive: item.isActive,

      campusId: campus ? campus._id.toString() : null,
      campusName: campus ? campus.campusName : 'Chưa gán cơ sở',

      lastConnection: item.lastConnection
        ? item.lastConnection.toISOString()
        : null,

      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  /* =========================
        CRUD
  ========================= */

  async create(dto: CreateLockerDto) {
    if (dto.campusId) await this.validateCampusId(dto.campusId);

    const exists = await this.lockerModel.exists({
      lockerNumber: dto.lockerNumber,
    });
    if (exists) {
      throw new BadRequestException('Locker number already exists');
    }

    const created = await this.lockerModel.create({
      ...dto,
      campusId: dto.campusId
        ? new Types.ObjectId(dto.campusId)
        : null,
    }); // Exclude lastConnection

    const populated = await created.populate('campusId', 'campusName');
    return this.mapResponse(populated);
  }

  async findAll(query: any = {}) {
    const filter: any = {};

    if (query.campusId) {
      if (!Types.ObjectId.isValid(query.campusId)) {
        throw new BadRequestException('Invalid campusId');
      }
      filter.campusId = query.campusId;
    }

    if (query.status) filter.status = query.status;
    if (query.isActive !== undefined)
      filter.isActive = query.isActive === 'true';

    console.log('Filter applied:', filter);
    console.log('Query received:', query);

    const items = await this.lockerModel
      .find(filter)
      .populate('campusId', 'campusName')
      .sort({ createdAt: -1 });

    console.log('Raw MongoDB query result:', items);

    if (!items || items.length === 0) {
      console.warn('No lockers found for the given query:', query);
    }

    const mappedItems = items.map((i) => this.mapResponse(i));

    console.log('Mapped response:', mappedItems);

    return {
      success: true,
      data: mappedItems,
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid locker id');

    const item = await this.lockerModel
      .findById(id)
      .populate('campusId', 'campusName');

    if (!item) throw new NotFoundException('Locker not found');
    return this.mapResponse(item);
  }

  async update(id: string, dto: UpdateLockerDto) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid locker id');

    const updateData: any = {};

    Object.keys(dto).forEach((key) => {
      if (dto[key] !== undefined && key !== 'lastConnection') {
        updateData[key] = dto[key]; // Exclude lastConnection
      }
    });

    // campusId logic
    if ('campusId' in dto) {
      if (dto.campusId === null) {
        updateData.campusId = null;
      } else {
        await this.validateCampusId(dto.campusId);
        updateData.campusId = new Types.ObjectId(dto.campusId);
      }
    }

    const updated = await this.lockerModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('campusId', 'campusName');

    if (!updated) throw new NotFoundException('Locker not found');
    return this.mapResponse(updated);
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid locker id');

    const removed = await this.lockerModel.findByIdAndDelete(id);
    if (!removed) throw new NotFoundException('Locker not found');

    return { success: true };
  }
}
