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
import { BookingTimeHelper } from './helpers/booking-time.helper';
import { BookingQueryHelper } from './helpers/booking-query.helper';
import { RoomService } from '@/modules/room/room.service';

@Injectable()
export class BookingService {
  private static readonly LEGACY_AUTO_CANCEL_REASON = 'lecturer cancel booking';
  private static readonly AUTO_REJECT_OVERDUE_REASON = 'Exceeded the allowed time limit.';

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Room.name)
    private readonly roomModel: Model<Room>,
    private readonly eventsGateway: EventsGateway,
    private readonly roomService: RoomService,
  ) {}

  private resolveCampusId(currentUser: any, campusFilter?: any): string {
    const fromFilter = campusFilter?.campusId;
    const fromUser = currentUser?.campusId;
    const campusId = fromFilter || fromUser;

    if (!campusId) {
        throw new BadRequestException('Cannot resolve campus for booking query');
    }

    return campusId.toString();
  }

  private toUTCDate(dateString: string): Date {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        throw new BadRequestException('Invalid booking date');
    }
    return date;
  }

  private validateTimeFormat(value: string, fieldName: string): void {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(value)) {
        throw new BadRequestException(`${fieldName} must use HH:mm format`);
    }
  }

  private resolveUserId(currentUser: any): string {
    const userId = currentUser?._id?.toString?.() || currentUser?._id;
    if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Cannot resolve current user');
    }
    return userId;
  }

  private async reserveRoom(roomId: any): Promise<void> {
    await this.roomService.markReservedIfActive(roomId);
  }

  private async releaseRoomIfNoApprovedBookings(roomId: any): Promise<void> {
    const roomText = roomId?.toString?.() || roomId;
    if (!roomText || !Types.ObjectId.isValid(roomText)) {
      return;
    }

    const roomObjectId = new Types.ObjectId(roomText);

    const hasApprovedBooking = await this.bookingModel
      .exists({
        roomId: roomObjectId,
        status: 'approved',
      })
      .exec();

    if (hasApprovedBooking) {
      return;
    }

    await this.roomService.markAvailableIfNotLocked(roomObjectId);
  }

  private async syncRoomStatusAfterBookingChange(
    previousStatus: string,
    nextStatus: string,
    previousRoomId: any,
    nextRoomId: any,
  ): Promise<void> {
    const prevRoomText = previousRoomId?.toString?.() || '';
    const nextRoomText = nextRoomId?.toString?.() || '';
    const roomChanged = prevRoomText !== nextRoomText;

    if (nextStatus === 'approved') {
      await this.reserveRoom(nextRoomId);
    }

    if (previousStatus === 'approved' && (nextStatus !== 'approved' || roomChanged)) {
      await this.releaseRoomIfNoApprovedBookings(previousRoomId);
    }

    if (nextStatus === 'completed') {
      await this.releaseRoomIfNoApprovedBookings(nextRoomId);
    }
  }

  private toDayRange(dateString: string): { start: Date; end: Date } {
    const date = this.toUTCDate(dateString);
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
  }

  private isOwnBooking(booking: any, userId: string): boolean {
    const lecturerId = booking?.lecturerId?.toString?.() || booking?.lecturerId;
    const requesterId = booking?.requesterId?.toString?.() || booking?.requesterId;
    return lecturerId === userId || requesterId === userId;
  }

  private normalizeBooking(booking: any): any {
    if (!booking) return booking;

    const lecturer = booking.lecturerId || booking.requesterId || null;
    const bookingDate = booking.bookingDate || booking.dateStart || booking.createdAt || null;

    return {
      ...booking,
      lecturerId: lecturer,
      bookingDate,
      note: booking.note ?? booking.notes ?? null,
    };
  }

  private applyBookingPopulate(query: any): any {
    return query
      .populate('roomId', 'roomCode roomName building floor')
      .populate('lecturerId', 'fullName email department employeeId')
      .populate('requesterId', 'fullName email department employeeId')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');
  }

  private async toBookingPayload(bookingDoc: any): Promise<any> {
    await bookingDoc.populate([
      { path: 'roomId', select: 'roomCode roomName building floor' },
      { path: 'lecturerId', select: 'fullName email department employeeId' },
      { path: 'requesterId', select: 'fullName email department employeeId' },
      { path: 'createdBy', select: 'fullName email' },
      { path: 'updatedBy', select: 'fullName email' },
    ]);
    return this.normalizeBooking(bookingDoc.toObject ? bookingDoc.toObject() : bookingDoc);
  }

  async create(dto: CreateBookingDto, currentUser: any, campusFilter?: any) {
    const campusId = this.resolveCampusId(currentUser, campusFilter);
    const bookingDate = this.toUTCDate(dto.bookingDate);

    this.validateTimeFormat(dto.startTime, 'startTime');
    this.validateTimeFormat(dto.endTime, 'endTime');

    const [lecturer, room] = await Promise.all([
      this.userModel.findOne({ _id: dto.lecturerId, campusId }).lean().exec(),
      this.roomModel.findOne({ _id: dto.roomId, campusId }).lean().exec(),
    ]);

    if (!lecturer) {
        throw new BadRequestException('Lecturer does not exist in current campus');
    }

    if (!room) {
        throw new BadRequestException('Room does not exist in current campus');
    }

    const created = await this.bookingModel.create({
      campusId: new Types.ObjectId(campusId),
      roomId: new Types.ObjectId(dto.roomId),
      lecturerId: new Types.ObjectId(dto.lecturerId),
      requesterId: new Types.ObjectId(dto.lecturerId),
      bookingDate,
      dateStart: bookingDate,
      dateEnd: bookingDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      purpose: dto.purpose,
      status: dto.status || 'pending',
      note: dto.note || null,
      notes: dto.note || null,
      createdBy: new Types.ObjectId(currentUser._id),
      updatedBy: new Types.ObjectId(currentUser._id),
    });

    const payload = await this.toBookingPayload(created);

    if (created.status === 'approved') {
      await this.reserveRoom(created.roomId);
    }

    this.eventsGateway.broadcastBookingUpdate('created', payload);

    return payload;
  }

  async createSelf(
    dto: Pick<CreateBookingDto, 'roomId' | 'bookingDate' | 'startTime' | 'endTime' | 'purpose'>,
    currentUser: any,
    campusFilter?: any,
  ) {
    const campusId = this.resolveCampusId(currentUser, campusFilter);
    const userId = this.resolveUserId(currentUser);

    this.validateTimeFormat(dto.startTime, 'startTime');
    this.validateTimeFormat(dto.endTime, 'endTime');

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('endTime must be later than startTime');
    }

    const room = await this.roomModel
      .findOne({
        _id: dto.roomId,
        campusId: new Types.ObjectId(campusId),
        status: 'available',
        isActive: { $ne: false },
      })
      .select('_id')
      .lean()
      .exec();

    if (!room) {
      throw new BadRequestException('Room does not exist or is unavailable');
    }

    const { start, end } = this.toDayRange(dto.bookingDate);

    const conflict = await this.bookingModel
      .findOne({
        campusId: new Types.ObjectId(campusId),
        roomId: new Types.ObjectId(dto.roomId),
        status: { $in: ['pending', 'approved'] },
        startTime: { $lt: dto.endTime },
        endTime: { $gt: dto.startTime },
        $or: [
          { bookingDate: { $gte: start, $lt: end } },
          { dateStart: { $gte: start, $lt: end } },
        ],
      })
      .lean()
      .exec();

    if (conflict) {
      throw new BadRequestException('This time range has already been booked');
    }

    const bookingDate = this.toUTCDate(dto.bookingDate);
    const startDateTime = BookingTimeHelper.toDateTime(bookingDate, dto.startTime);
    const isOverdueAtCreate = startDateTime ? startDateTime.getTime() <= Date.now() : false;

    const status = isOverdueAtCreate ? 'rejected' : 'pending';
    const rejectReason = isOverdueAtCreate
      ? BookingService.AUTO_REJECT_OVERDUE_REASON
      : null;

    const created = await this.bookingModel.create({
      campusId: new Types.ObjectId(campusId),
      roomId: new Types.ObjectId(dto.roomId),
      lecturerId: new Types.ObjectId(userId),
      requesterId: new Types.ObjectId(userId),
      bookingDate,
      dateStart: bookingDate,
      dateEnd: bookingDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      purpose: dto.purpose,
      status,
      rejectReason,
      note: null,
      notes: null,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    const payload = await this.toBookingPayload(created);
    this.eventsGateway.broadcastBookingUpdate('created', payload);
    return payload;
  }

  async findSelf(query: QueryBookingDto, currentUser: any, campusFilter?: any) {
    const userId = this.resolveUserId(currentUser);
    const normalizedQuery: QueryBookingDto = {
      ...query,
      lecturerId: userId,
    };

    return this.findAll(normalizedQuery, currentUser, campusFilter);
  }

  async cancelSelf(id: string, cancelReason: string, currentUser: any, campusFilter?: any) {
    if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid booking ID');
    }

    const campusId = this.resolveCampusId(currentUser, campusFilter);
    const userId = this.resolveUserId(currentUser);

    const booking = await this.bookingModel.findOne({
      _id: id,
      campusId: new Types.ObjectId(campusId),
    });

    if (!booking) {
        throw new NotFoundException('Booking not found');
    }

    if (!this.isOwnBooking(booking, userId)) {
        throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'pending') {
        throw new BadRequestException('Only pending bookings can be cancelled');
    }

    const reason = (cancelReason || '').trim();
    if (!reason) {
        throw new BadRequestException('Please enter a cancellation reason');
    }

    if (reason.toLowerCase() === BookingService.LEGACY_AUTO_CANCEL_REASON) {
        throw new BadRequestException('Please provide a specific cancellation reason, not the default text');
    }

    booking.status = 'cancelled';
    booking.updatedBy = new Types.ObjectId(userId);
    booking.note = reason;
    booking.notes = reason;
    await booking.save();

    const payload = await this.toBookingPayload(booking);
    this.eventsGateway.broadcastBookingUpdate('updated', payload);
    return payload;
  }

  async getSelfAvailableRooms(
    currentUser: any,
    campusFilter?: any,
    bookingDate?: string,
    startTime?: string,
    endTime?: string,
  ) {
    const campusId = this.resolveCampusId(currentUser, campusFilter);
    const campusObjectId = new Types.ObjectId(campusId);

    if ((startTime || endTime) && !(startTime && endTime)) {
      throw new BadRequestException('Both startTime and endTime are required');
    }

    if (startTime && endTime) {
      this.validateTimeFormat(startTime, 'startTime');
      this.validateTimeFormat(endTime, 'endTime');
      if (startTime >= endTime) {
        throw new BadRequestException('endTime must be later than startTime');
      }
    }

    const rooms = await this.roomModel
      .find({
        campusId: campusObjectId,
        status: 'available',
        isActive: { $ne: false },
      })
      .select('_id roomCode roomName building floor capacity roomType status isActive')
      .sort({ roomCode: 1 })
      .lean()
      .exec();

    if (!bookingDate || !startTime || !endTime || rooms.length === 0) {
      return rooms;
    }

    const { start, end } = this.toDayRange(bookingDate);
    const roomIds = rooms.map((room) => room._id);

    const busyRows = await this.bookingModel
      .find({
        campusId: campusObjectId,
        roomId: { $in: roomIds },
        status: { $in: ['pending', 'approved'] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        $or: [
          { bookingDate: { $gte: start, $lt: end } },
          { dateStart: { $gte: start, $lt: end } },
        ],
      })
      .select('roomId')
      .lean()
      .exec();

    const busyRoomIds = new Set(busyRows.map((item: any) => item.roomId?.toString?.() || String(item.roomId)));
    return rooms.filter((room: any) => !busyRoomIds.has(room._id.toString()));
  }

  async getSelfBookingGrid(currentUser: any, campusFilter?: any, bookingDate?: string) {
    const campusId = this.resolveCampusId(currentUser, campusFilter);
    const campusObjectId = new Types.ObjectId(campusId);
    const targetDate = bookingDate || new Date().toISOString().slice(0, 10);

    const { start, end } = this.toDayRange(targetDate);

    const [rooms, rows] = await Promise.all([
      this.roomModel
        .find({
          campusId: campusObjectId,
          isActive: { $ne: false },
        })
        .select('_id roomCode roomName building floor capacity status isActive')
        .sort({ roomCode: 1 })
        .lean()
        .exec(),
      this.bookingModel
        .find({
          campusId: campusObjectId,
          status: { $in: ['pending', 'approved'] },
          $or: [
            { bookingDate: { $gte: start, $lt: end } },
            { dateStart: { $gte: start, $lt: end } },
          ],
        })
        .populate('lecturerId', 'fullName email')
        .populate('requesterId', 'fullName email')
        .select('_id roomId lecturerId requesterId purpose status startTime endTime')
        .lean()
        .exec(),
    ]);

    const slots = BookingTimeHelper.OLD_SLOTS.map((slot) => ({
      ...slot,
      label: `SLOT ${slot.slotNumber} (${slot.startTime}-${slot.endTime})`,
    }));

    const normalizedRooms = rooms.map((room: any) => ({
      roomId: room._id.toString(),
      roomCode: room.roomCode,
      roomName: room.roomName,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      status: room.status,
      isActive: room.isActive,
    }));

    const bookings = (rows as any[]).map((booking) => {
      const lecturer = booking.lecturerId || booking.requesterId || null;
      const lecturerName = lecturer?.fullName || lecturer?.email || 'Another lecturer';

      return {
        bookingId: booking._id?.toString?.() || String(booking._id),
        roomId: booking?.roomId?.toString?.() || String(booking?.roomId || ''),
        status: booking.status,
        purpose: booking.purpose || '',
        lecturerName,
        startTime: booking.startTime,
        endTime: booking.endTime,
      };
    });

    return {
      bookingDate: targetDate,
      slotType: 'OLDSLOT',
      slots,
      rooms: normalizedRooms,
      bookings,
    };
  }

  async findAll(query: QueryBookingDto, currentUser: any, campusFilter?: any) {
    const campusId = this.resolveCampusId(currentUser, campusFilter);
    const andConditions: any[] = [{ campusId: new Types.ObjectId(campusId) }];

    if (query.roomId) {
      andConditions.push({ roomId: new Types.ObjectId(query.roomId) });
    }

    if (query.lecturerId) {
      const lecturerObjectId = new Types.ObjectId(query.lecturerId);
      andConditions.push({
        $or: [{ lecturerId: lecturerObjectId }, { requesterId: lecturerObjectId }],
      });
    }

    if (query.status) {
      andConditions.push({ status: query.status });
    }

    const dateCondition = BookingQueryHelper.normalizeDateRange(
      query.fromDate ? this.toUTCDate(query.fromDate) : undefined,
      query.toDate ? this.toUTCDate(query.toDate) : undefined,
    );

    if (dateCondition) {
      andConditions.push({
        $or: [{ bookingDate: dateCondition }, { dateStart: dateCondition }],
      });
    }

    if (query.lecturerSearch) {
      const keyword = query.lecturerSearch.trim();
      if (keyword.length > 0) {
        const lecturers = await this.userModel
          .find({
            campusId: new Types.ObjectId(campusId),
            $or: [
              { fullName: BookingQueryHelper.buildSearchRegex(keyword) },
              { email: BookingQueryHelper.buildSearchRegex(keyword) },
            ],
          })
          .select('_id')
          .lean()
          .exec();

        const lecturerIds = lecturers.map((user) => user._id);

        if (lecturerIds.length === 0) {
          return [];
        }

        andConditions.push({
          $or: [{ lecturerId: { $in: lecturerIds } }, { requesterId: { $in: lecturerIds } }],
        });
      }
    }

    const filter =
      andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

    const rows = await this.applyBookingPopulate(
      this.bookingModel
        .find(filter)
        .sort({ bookingDate: -1, dateStart: -1, startTime: 1, createdAt: -1 }),
    )
      .lean()
      .exec();

    return rows.map((item) => this.normalizeBooking(item));
  }

  async findOne(id: string, currentUser: any, campusFilter?: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const campusId = this.resolveCampusId(currentUser, campusFilter);

    const booking = await this.applyBookingPopulate(
      this.bookingModel.findOne({ _id: id, campusId: new Types.ObjectId(campusId) }),
    ).exec();

    if (!booking) {
      throw new NotFoundException('Booking not found in current campus');
    }

    return this.normalizeBooking(booking.toObject());
  }

  async update(id: string, dto: UpdateBookingDto, currentUser: any, campusFilter?: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const campusId = this.resolveCampusId(currentUser, campusFilter);

    const booking = await this.bookingModel.findOne({
      _id: id,
      campusId: new Types.ObjectId(campusId),
    });

    if (!booking) {
      throw new NotFoundException('Booking to update was not found');
    }

    const previousStatus = booking.status;
    const previousRoomId = booking.roomId;

    if (dto.status === 'cancelled') {
      throw new BadRequestException(
        'Status cancelled can only be set by booking owner cancellation',
      );
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
        throw new BadRequestException('Room does not exist in current campus');
      }
    }

    if (dto.lecturerId) {
      const lecturer = await this.userModel
        .findOne({ _id: dto.lecturerId, campusId: new Types.ObjectId(campusId) })
        .lean()
        .exec();
      if (!lecturer) {
        throw new BadRequestException('Lecturer does not exist in current campus');
      }
    }

    const updateData: any = {
      updatedBy: new Types.ObjectId(currentUser._id),
    };

    if (dto.roomId) {
      updateData.roomId = new Types.ObjectId(dto.roomId);
    }

    if (dto.lecturerId) {
      updateData.lecturerId = new Types.ObjectId(dto.lecturerId);
      updateData.requesterId = new Types.ObjectId(dto.lecturerId);
    }

    if (dto.bookingDate) {
      const nextDate = this.toUTCDate(dto.bookingDate);
      updateData.bookingDate = nextDate;
      updateData.dateStart = nextDate;
      updateData.dateEnd = nextDate;
    }
    if (dto.startTime) updateData.startTime = dto.startTime;
    if (dto.endTime) updateData.endTime = dto.endTime;
    if (dto.purpose) updateData.purpose = dto.purpose;
    if (dto.status) updateData.status = dto.status;
    if (dto.note !== undefined) {
      updateData.note = dto.note;
      updateData.notes = dto.note;
    }
    if (dto.rejectReason !== undefined) updateData.rejectReason = dto.rejectReason;

    booking.set(updateData);
    await booking.save();

    const nextStatus = dto.status || previousStatus;
    const nextRoomId = dto.roomId ? new Types.ObjectId(dto.roomId) : previousRoomId;
    await this.syncRoomStatusAfterBookingChange(
      previousStatus,
      nextStatus,
      previousRoomId,
      nextRoomId,
    );

    const payload = await this.toBookingPayload(booking);
    this.eventsGateway.broadcastBookingUpdate('updated', payload);

    return payload;
  }

  async completeBooking(id: string, currentUser: any, campusFilter?: any) {
    if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid booking ID');
    }

    const campusId = this.resolveCampusId(currentUser, campusFilter);

    const booking = await this.bookingModel.findOne({
      _id: id,
      campusId: new Types.ObjectId(campusId),
    });

    if (!booking) {
        throw new NotFoundException('Booking to complete was not found');
    }

    if (booking.status !== 'approved') {
        throw new BadRequestException('Only approved bookings can be completed');
    }

    booking.status = 'completed';
    booking.updatedBy = new Types.ObjectId(currentUser._id);
    await booking.save();

    await this.releaseRoomIfNoApprovedBookings(booking.roomId);

    const payload = await this.toBookingPayload(booking);
    this.eventsGateway.broadcastBookingUpdate('updated', payload);
    return payload;
  }

  async remove(id: string, currentUser: any, campusFilter?: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid booking ID');
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
      throw new NotFoundException('Booking to delete was not found');
    }

    if (deleted.status === 'approved') {
      await this.releaseRoomIfNoApprovedBookings(deleted.roomId);
    }

    this.eventsGateway.broadcastBookingUpdate('deleted', {
      _id: id,
      campusId,
    });
  }
}
