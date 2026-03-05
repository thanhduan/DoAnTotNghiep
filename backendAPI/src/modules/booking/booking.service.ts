import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from '@/database/schemas/booking.schema';
import { User } from '@/database/schemas/user.schema';
import { Room } from '@/database/schemas/room.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { EventsGateway } from '@/common/gateways/events.gateway';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Room.name)
    private readonly roomModel: Model<Room>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private resolveCampusId(currentUser: any, campusFilter?: any): string {
    const fromFilter = campusFilter?.campusId;
    const fromUser = currentUser?.campusId;
    const campusId = fromFilter || fromUser;

    if (!campusId) {
      throw new BadRequestException('Không xác định được campus để truy vấn booking');
    }

    return campusId.toString();
  }

  private toUTCDate(dateString: string): Date {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Ngày booking không hợp lệ');
    }
    return date;
  }

  private validateTimeFormat(value: string, fieldName: string): void {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(value)) {
      throw new BadRequestException(`${fieldName} phải có định dạng HH:mm`);
    }
  }

  async create(dto: CreateBookingDto, currentUser: any, campusFilter?: any) {
    const campusId = this.resolveCampusId(currentUser, campusFilter);

    this.validateTimeFormat(dto.startTime, 'startTime');
    this.validateTimeFormat(dto.endTime, 'endTime');

    const [lecturer, room] = await Promise.all([
      this.userModel.findOne({ _id: dto.lecturerId, campusId }).lean().exec(),
      this.roomModel.findOne({ _id: dto.roomId, campusId }).lean().exec(),
    ]);

    if (!lecturer) {
      throw new BadRequestException('Giảng viên không tồn tại trong campus hiện tại');
    }

    if (!room) {
      throw new BadRequestException('Phòng không tồn tại trong campus hiện tại');
    }

    const created = await this.bookingModel.create({
      campusId: new Types.ObjectId(campusId),
      roomId: new Types.ObjectId(dto.roomId),
      lecturerId: new Types.ObjectId(dto.lecturerId),
      bookingDate: this.toUTCDate(dto.bookingDate),
      startTime: dto.startTime,
      endTime: dto.endTime,
      purpose: dto.purpose,
      status: dto.status || 'pending',
      note: dto.note || null,
      createdBy: new Types.ObjectId(currentUser._id),
      updatedBy: new Types.ObjectId(currentUser._id),
    });

    const payload = await this.findOne(created._id.toString(), currentUser, campusFilter);
    this.eventsGateway.broadcastBookingUpdate('created', payload);

    return payload;
  }

  async findAll(query: QueryBookingDto, currentUser: any, campusFilter?: any) {
    const campusId = this.resolveCampusId(currentUser, campusFilter);
    const filter: any = {
      campusId: new Types.ObjectId(campusId),
    };

    if (query.roomId) {
      filter.roomId = new Types.ObjectId(query.roomId);
    }

    if (query.lecturerId) {
      filter.lecturerId = new Types.ObjectId(query.lecturerId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.fromDate || query.toDate) {
      filter.bookingDate = {};
      if (query.fromDate) {
        filter.bookingDate.$gte = this.toUTCDate(query.fromDate);
      }
      if (query.toDate) {
        filter.bookingDate.$lte = this.toUTCDate(query.toDate);
      }
    }

    if (query.lecturerSearch) {
      const keyword = query.lecturerSearch.trim();
      if (keyword.length > 0) {
        const lecturers = await this.userModel
          .find({
            campusId: new Types.ObjectId(campusId),
            $or: [
              { fullName: { $regex: keyword, $options: 'i' } },
              { email: { $regex: keyword, $options: 'i' } },
            ],
          })
          .select('_id')
          .lean()
          .exec();

        const lecturerIds = lecturers.map((user) => user._id);

        if (lecturerIds.length === 0) {
          return [];
        }

        filter.lecturerId = { $in: lecturerIds };
      }
    }

    return this.bookingModel
      .find(filter)
      .populate('roomId', 'roomCode roomName building floor')
      .populate('lecturerId', 'fullName email department employeeId')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .sort({ bookingDate: -1, startTime: 1 })
      .lean()
      .exec();
  }

  async findOne(id: string, currentUser: any, campusFilter?: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Booking ID không hợp lệ');
    }

    const campusId = this.resolveCampusId(currentUser, campusFilter);

    const booking = await this.bookingModel
      .findOne({ _id: id, campusId: new Types.ObjectId(campusId) })
      .populate('roomId', 'roomCode roomName building floor')
      .populate('lecturerId', 'fullName email department employeeId')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .exec();

    if (!booking) {
      throw new NotFoundException('Không tìm thấy booking trong campus hiện tại');
    }

    return booking;
  }

  async update(id: string, dto: UpdateBookingDto, currentUser: any, campusFilter?: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Booking ID không hợp lệ');
    }

    const campusId = this.resolveCampusId(currentUser, campusFilter);

    const booking = await this.bookingModel.findOne({
      _id: id,
      campusId: new Types.ObjectId(campusId),
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy booking để cập nhật');
    }

    if (dto.startTime) {
      this.validateTimeFormat(dto.startTime, 'startTime');
    }

    if (dto.endTime) {
      this.validateTimeFormat(dto.endTime, 'endTime');
    }

    if (dto.roomId) {
      const room = await this.roomModel
        .findOne({ _id: dto.roomId, campusId: new Types.ObjectId(campusId) })
        .lean()
        .exec();
      if (!room) {
        throw new BadRequestException('Phòng không tồn tại trong campus hiện tại');
      }
      booking.roomId = new Types.ObjectId(dto.roomId);
    }

    if (dto.lecturerId) {
      const lecturer = await this.userModel
        .findOne({ _id: dto.lecturerId, campusId: new Types.ObjectId(campusId) })
        .lean()
        .exec();
      if (!lecturer) {
        throw new BadRequestException('Giảng viên không tồn tại trong campus hiện tại');
      }
      booking.lecturerId = new Types.ObjectId(dto.lecturerId);
    }

    if (dto.bookingDate) booking.bookingDate = this.toUTCDate(dto.bookingDate);
    if (dto.startTime) booking.startTime = dto.startTime;
    if (dto.endTime) booking.endTime = dto.endTime;
    if (dto.purpose) booking.purpose = dto.purpose;
    if (dto.status) booking.status = dto.status;
    if (dto.note !== undefined) booking.note = dto.note;
    if (dto.rejectReason !== undefined) booking.rejectReason = dto.rejectReason;

    booking.updatedBy = new Types.ObjectId(currentUser._id);
    await booking.save();

    const payload = await this.findOne(booking._id.toString(), currentUser, campusFilter);
    this.eventsGateway.broadcastBookingUpdate('updated', payload);

    return payload;
  }

  async remove(id: string, currentUser: any, campusFilter?: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Booking ID không hợp lệ');
    }

    const campusId = this.resolveCampusId(currentUser, campusFilter);

    const deleted = await this.bookingModel
      .findOneAndDelete({
        _id: id,
        campusId: new Types.ObjectId(campusId),
      })
      .lean()
      .exec();

    if (!deleted) {
      throw new NotFoundException('Không tìm thấy booking để xóa');
    }

    this.eventsGateway.broadcastBookingUpdate('deleted', {
      _id: id,
      campusId,
    });
  }
}
