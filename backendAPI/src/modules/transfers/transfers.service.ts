import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transfer } from '@/database/schemas/transfer.schema';
import { Schedule } from '@/database/schemas/schedule.schema';
import { Booking } from '@/database/schemas/booking.schema';
import { User } from '@/database/schemas/user.schema';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { EventsGateway } from '../../common/gateways/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<Transfer>,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createTransferDto: CreateTransferDto, currentUser: any): Promise<Transfer> {
    const fromUserId = this.normalizeId(currentUser?._id);
    const campusId = this.normalizeId(currentUser?.campusId);

    if (!fromUserId || !campusId) {
      throw new ForbiddenException('Missing user identity or campus scope');
    }

    const transferDate = createTransferDto.transferDate
      ? new Date(createTransferDto.transferDate)
      : undefined;

    const created = new this.transferModel({
      ...createTransferDto,
      transferDate,
      fromUserId,
      campusId,
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

    const targetScheduleIds = Array.from(
      new Set(
        transfers
          .map((item: any) => String(item?.toScheduleId || ''))
          .filter((id) => Types.ObjectId.isValid(id)),
      ),
    );

    const campusObjectId = Types.ObjectId.isValid(campusId) ? new Types.ObjectId(campusId) : null;

    const targetSchedulesByCampus = targetScheduleIds.length
      ? await this.scheduleModel
          .find({
            _id: { $in: targetScheduleIds },
            ...(campusObjectId ? { campusId: campusObjectId } : {}),
          })
          .populate('lecturerId', 'fullName email')
          .select('_id lecturerId slotType slotNumber startTime endTime roomId dateStart')
          .lean()
          .exec()
      : [];

    const missingScheduleIds = targetScheduleIds.filter(
      (id) => !targetSchedulesByCampus.some((item: any) => String(item?._id) === id),
    );

    const targetSchedulesGlobal = missingScheduleIds.length
      ? await this.scheduleModel
          .find({
            _id: { $in: missingScheduleIds },
          })
          .populate('lecturerId', 'fullName email')
          .select('_id lecturerId slotType slotNumber startTime endTime roomId dateStart')
          .lean()
          .exec()
      : [];

    const targetSchedules = [...targetSchedulesByCampus, ...targetSchedulesGlobal];

    const targetBookingsByCampus = targetScheduleIds.length
      ? await this.bookingModel
          .find({
            _id: { $in: targetScheduleIds },
            ...(campusObjectId ? { campusId: campusObjectId } : {}),
          })
          .populate('lecturerId', 'fullName email')
          .populate('roomId', 'roomCode roomName')
          .select('_id lecturerId roomId bookingDate startTime endTime')
          .lean()
          .exec()
      : [];

    const missingBookingIds = targetScheduleIds.filter(
      (id) => !targetBookingsByCampus.some((item: any) => String(item?._id) === id),
    );

    const targetBookingsGlobal = missingBookingIds.length
      ? await this.bookingModel
          .find({
            _id: { $in: missingBookingIds },
          })
          .populate('lecturerId', 'fullName email')
          .populate('roomId', 'roomCode roomName')
          .select('_id lecturerId roomId bookingDate startTime endTime')
          .lean()
          .exec()
      : [];

    const targetBookings = [...targetBookingsByCampus, ...targetBookingsGlobal];

    const fallbackLecturerIds = Array.from(
      new Set(transfers.map((item: any) => String(item?.toUserId || '')).filter((id) => Types.ObjectId.isValid(id))),
    );

    const fallbackLecturersByCampus = fallbackLecturerIds.length
      ? await this.userModel
          .find({
            _id: { $in: fallbackLecturerIds },
            ...(campusObjectId ? { campusId: campusObjectId } : {}),
          })
          .select('_id fullName email')
          .lean()
          .exec()
      : [];

    const missingLecturerIds = fallbackLecturerIds.filter(
      (id) => !fallbackLecturersByCampus.some((item: any) => String(item?._id) === id),
    );

    const fallbackLecturersGlobal = missingLecturerIds.length
      ? await this.userModel
          .find({
            _id: { $in: missingLecturerIds },
          })
          .select('_id fullName email')
          .lean()
          .exec()
      : [];

    const fallbackLecturers = [...fallbackLecturersByCampus, ...fallbackLecturersGlobal];

    const targetById = new Map<string, any>();
    for (const schedule of targetSchedules as any[]) {
      const scheduleLecturerId =
        schedule?.lecturerId?._id?.toString?.() || String(schedule?.lecturerId || '');

      targetById.set(String(schedule?._id), {
        scheduleId: String(schedule?._id),
        lecturer: {
          _id: scheduleLecturerId,
          fullName: schedule?.lecturerId?.fullName || '',
          email: schedule?.lecturerId?.email || '',
        },
        slotType: schedule?.slotType || '',
        slotNumber: Number(schedule?.slotNumber || 0),
        startTime: schedule?.startTime || '',
        endTime: schedule?.endTime || '',
        roomId: schedule?.roomId?.toString?.() || String(schedule?.roomId || ''),
        transferDate: schedule?.dateStart || null,
      });
    }

    for (const booking of targetBookings as any[]) {
      const bookingId = String(booking?._id || '');
      if (!bookingId || targetById.has(bookingId)) {
        continue;
      }

      const bookingLecturerId =
        booking?.lecturerId?._id?.toString?.() || String(booking?.lecturerId || '');

      targetById.set(bookingId, {
        scheduleId: bookingId,
        lecturer: {
          _id: bookingLecturerId,
          fullName: booking?.lecturerId?.fullName || '',
          email: booking?.lecturerId?.email || '',
        },
        slotType: '',
        slotNumber: 0,
        startTime: booking?.startTime || '',
        endTime: booking?.endTime || '',
        roomId: booking?.roomId?._id?.toString?.() || String(booking?.roomId || ''),
        roomCode: booking?.roomId?.roomCode || '',
        transferDate: booking?.bookingDate || null,
      });
    }

    const fallbackLecturerById = new Map<string, any>();
    for (const lecturer of fallbackLecturers as any[]) {
      fallbackLecturerById.set(String(lecturer?._id), lecturer);
    }

    return transfers.reduce(
      (acc, item: any) => {
        const sourceId = String(item?.fromScheduleId || '');
        if (!sourceId || acc[sourceId]) {
          return acc;
        }

        const targetSchedule = targetById.get(String(item?.toScheduleId || '')) || null;
        const fallbackLecturer = fallbackLecturerById.get(String(item?.toUserId || ''));
        const hasTargetLecturerData = Boolean(
          targetSchedule?.lecturer?._id ||
            targetSchedule?.lecturer?.fullName ||
            targetSchedule?.lecturer?.email,
        );

        const targetLecturer = hasTargetLecturerData
          ? {
              _id: String(targetSchedule?.lecturer?._id || ''),
              fullName:
                targetSchedule?.lecturer?.fullName || fallbackLecturer?.fullName || 'Unknown lecturer',
              email: targetSchedule?.lecturer?.email || fallbackLecturer?.email || '',
            }
          : fallbackLecturer
            ? {
                _id: String(fallbackLecturer?._id || ''),
                fullName: fallbackLecturer?.fullName || 'Unknown lecturer',
                email: fallbackLecturer?.email || '',
              }
            : {
                _id: String(item?.toUserId || ''),
                fullName: 'Unknown lecturer',
                email: '',
              };

        const targetScheduleWithFallback = targetSchedule
          ? {
              ...targetSchedule,
              lecturer: {
                _id: String(targetSchedule?.lecturer?._id || targetLecturer?._id || ''),
                fullName:
                  targetSchedule?.lecturer?.fullName || targetLecturer?.fullName || 'Unknown lecturer',
                email: targetSchedule?.lecturer?.email || targetLecturer?.email || '',
              },
            }
          : null;

        acc[sourceId] = {
          ...item,
          targetLecturer,
          targetSchedule:
            targetScheduleWithFallback ||
            (fallbackLecturer
              ? {
                  scheduleId: String(item?.toScheduleId || ''),
                  lecturer: {
                    _id: String(fallbackLecturer?._id || ''),
                    fullName: fallbackLecturer?.fullName || '',
                    email: fallbackLecturer?.email || '',
                  },
                  slotType: '',
                  slotNumber: 0,
                  startTime: '',
                  endTime: '',
                  roomId: '',
                  roomCode: '',
                  transferDate: item?.transferDate || null,
                }
              : {
                  scheduleId: String(item?.toScheduleId || ''),
                  lecturer: {
                    _id: String(item?.toUserId || ''),
                    fullName: 'Unknown lecturer',
                    email: '',
                  },
                  slotType: '',
                  slotNumber: 0,
                  startTime: '',
                  endTime: '',
                  roomId: '',
                  roomCode: '',
                  transferDate: item?.transferDate || null,
                }),
        };
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  async cancel(id: string, currentUser: any): Promise<Transfer> {
    const transfer = await this.transferModel.findById(id);

    if (!transfer) throw new NotFoundException('Transfer not found');

    const currentCampusId = this.normalizeId(currentUser?.campusId);
    const transferCampusId = this.normalizeId((transfer as any)?.campusId);

    if (
      !currentCampusId ||
      !transferCampusId ||
      transferCampusId !== currentCampusId
    ) {
      throw new ForbiddenException('Transfer is not in your campus scope');
    }

    const isOwner = this.normalizeId((transfer as any)?.fromUserId) === this.normalizeId(currentUser?._id);
    if (!isOwner && currentUser.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only transfer owner or super admin can cancel transfer request');
    }

    if (transfer.status !== 'pending') {
      throw new BadRequestException('Only pending transfer requests can be cancelled');
    }

    transfer.status = 'cancelled';
    (transfer as any).cancelledAt = new Date();

    await transfer.save();

    const transferIdText = this.normalizeId((transfer as any)?._id || (transfer as any)?.id) || id;
    const traceId = `transfer-cancel-${transferIdText}-${Date.now()}`;

    this.eventsGateway.server.emit('transfer:cancelled', {
      transferId: transfer._id,
      data: transfer,
    });

    try {
      const notificationPayload = await this.buildTransferCancelNotificationPayload(transfer, currentUser);
      (notificationPayload as any).traceId = traceId;

      this.logger.log(
        `[transfer-cancel-debug] Dispatch transfer cancel notification. traceId=${traceId}, transferId=${notificationPayload?._id}, actorId=${this.normalizeId(currentUser?._id || currentUser?.id) || 'unknown'}`,
      );

      await this.notificationsService.dispatchTransferCancelledNotification(
        notificationPayload,
        currentUser,
      );

      this.logger.log(
        `[transfer-cancel-debug] Dispatch transfer cancel notification done. traceId=${traceId}, transferId=${notificationPayload?._id}`,
      );
    } catch (error) {
      this.logger.warn(
        `[transfer-cancel-debug] Failed to dispatch transfer cancel notification. traceId=${traceId}, transferId=${transferIdText}, error=${error}`,
      );
    }

    return transfer;
  }

  private normalizeId(value: any): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed === '[object Object]') {
        return null;
      }
      return trimmed;
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (typeof value === 'object') {
      if (value._id) {
        return this.normalizeId(value._id);
      }

      if (value.id) {
        return this.normalizeId(value.id);
      }
    }

    return null;
  }

  private async buildTransferCancelNotificationPayload(transfer: any, actor: any): Promise<any> {
    const plainTransfer = typeof transfer?.toObject === 'function' ? transfer.toObject() : transfer;

    const transferId = this.normalizeId(plainTransfer?._id || plainTransfer?.id);
    const campusId =
      this.normalizeId(plainTransfer?.campusId) || this.normalizeId(actor?.campusId) || undefined;
    const fromScheduleId = this.normalizeId(plainTransfer?.fromScheduleId) || undefined;
    const toScheduleId = this.normalizeId(plainTransfer?.toScheduleId) || undefined;
    const fromUserId =
      this.normalizeId(plainTransfer?.fromUserId) || this.normalizeId(actor?._id || actor?.id) || undefined;

    let toUserId = this.normalizeId(plainTransfer?.toUserId) || undefined;

    if (!toUserId && toScheduleId) {
      const scheduleDoc = await this.scheduleModel
        .findById(toScheduleId)
        .select('lecturerId')
        .lean()
        .exec();

      toUserId = this.normalizeId((scheduleDoc as any)?.lecturerId) || toUserId;

      if (!toUserId) {
        const bookingDoc = await this.bookingModel
          .findById(toScheduleId)
          .select('lecturerId')
          .lean()
          .exec();

        toUserId = this.normalizeId((bookingDoc as any)?.lecturerId) || toUserId;
      }
    }

    return {
      _id: transferId,
      id: transferId,
      campusId,
      fromUserId,
      toUserId,
      roomId: this.normalizeId(plainTransfer?.roomId) || undefined,
      lockerId: this.normalizeId(plainTransfer?.lockerId) || undefined,
      fromScheduleId,
      toScheduleId,
      transferDate: plainTransfer?.transferDate || null,
      status: plainTransfer?.status || 'cancelled',
      reason: String(plainTransfer?.reason || '').trim() || null,
      notes: String(plainTransfer?.notes || '').trim() || null,
    };
  }
}
