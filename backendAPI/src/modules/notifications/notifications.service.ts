import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '@/database/schemas/notification.schema';
import { User } from '@/database/schemas/user.schema';
import { Role } from '@/database/schemas/role.schema';
import { Booking } from '@/database/schemas/booking.schema';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { CreateNotificationInput, TransferCancelledJobPayload } from './notifications.types';
import { EventsGateway } from '@/common/gateways/events.gateway';
import { NotificationsQueueService } from './notifications.queue';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsQueueService: NotificationsQueueService,
  ) {}

  async findMine(currentUser: any, campusFilter: any, query: QueryNotificationsDto) {
    const userId = currentUser?._id;
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(50, Number(query.limit || 20)));
    const unreadOnly = query.unreadOnly === true;

    const filter: any = {
      recipientId: new Types.ObjectId(userId),
    };

    if (campusFilter?.campusId) {
      filter.campusId = new Types.ObjectId(campusFilter.campusId);
    }

    if (unreadOnly) {
      filter.isRead = false;
    }

    const [rows, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({
        recipientId: new Types.ObjectId(userId),
        ...(campusFilter?.campusId ? { campusId: new Types.ObjectId(campusFilter.campusId) } : {}),
        isRead: false,
      }),
    ]);

    return {
      data: rows.map((item: any) => this.mapNotification(item)),
      meta: {
        page,
        limit,
        total,
        unreadCount,
        hasMore: page * limit < total,
      },
    };
  }

  async getUnreadCount(currentUser: any, campusFilter: any): Promise<number> {
    const userId = currentUser?._id;
    return this.notificationModel.countDocuments({
      recipientId: new Types.ObjectId(userId),
      ...(campusFilter?.campusId ? { campusId: new Types.ObjectId(campusFilter.campusId) } : {}),
      isRead: false,
    });
  }

  async markAsRead(id: string, currentUser: any, campusFilter: any) {
    const userId = new Types.ObjectId(currentUser?._id);

    const notification = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: id,
          recipientId: userId,
          ...(campusFilter?.campusId ? { campusId: new Types.ObjectId(campusFilter.campusId) } : {}),
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        },
        { new: true },
      )
      .lean()
      .exec();

    return notification ? this.mapNotification(notification) : null;
  }

  async markAllAsRead(currentUser: any, campusFilter: any): Promise<number> {
    const userId = new Types.ObjectId(currentUser?._id);

    const result = await this.notificationModel
      .updateMany(
        {
          recipientId: userId,
          ...(campusFilter?.campusId ? { campusId: new Types.ObjectId(campusFilter.campusId) } : {}),
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        },
      )
      .exec();

    return result.modifiedCount || 0;
  }

  async notifyBookingPendingApproval(bookingPayload: any): Promise<void> {
    try {
      const bookingId = this.extractObjectId(bookingPayload?._id);
      const campusId = this.extractObjectId(bookingPayload?.campusId);
      const requesterId = this.extractObjectId(bookingPayload?.lecturerId?._id || bookingPayload?.lecturerId);
      const roomCode = bookingPayload?.roomId?.roomCode || 'Unknown room';
      const requesterName = bookingPayload?.lecturerId?.fullName || bookingPayload?.lecturerId?.email || 'Lecturer';

      if (!bookingId || !campusId) {
        return;
      }

      const approverIds = await this.findBookingApproverIds(campusId);
      const recipients = approverIds.filter((id) => id !== requesterId);
      if (recipients.length === 0) {
        this.logger.warn(`No booking approvers found for campus ${campusId}`);
        return;
      }

      await this.createAndBroadcastMany(
        recipients.map((recipientId) => ({
          recipientId,
          campusId,
          senderId: null,
          type: 'booking_pending',
          title: `New booking needs approval: ${roomCode}`,
          message: `${requesterName} created a booking request for room ${roomCode}`,
          priority: 'high',
          data: {
            bookingId,
            roomCode,
          },
          dedupeKey: `booking-created:${bookingId}:recipient:${recipientId}`,
        })),
      );

      await this.notificationsQueueService.scheduleBookingReminder(
        { bookingId, campusId },
        this.getReminderDelayMs(),
      );
    } catch (error) {
      this.logger.warn(`Failed to dispatch booking notifications: ${error}`);
    }
  }

  async notifyBookingReminderIfPending(bookingId: string, campusId: string): Promise<void> {
    const booking = await this.bookingModel
      .findOne({
        _id: new Types.ObjectId(bookingId),
        campusId: new Types.ObjectId(campusId),
      })
      .populate('roomId', 'roomCode roomName')
      .populate('lecturerId', 'fullName email')
      .lean()
      .exec();

    if (!booking || booking.status !== 'pending') {
      return;
    }

    const roomCode = (booking as any)?.roomId?.roomCode || 'Unknown room';
    const requesterName =
      (booking as any)?.lecturerId?.fullName || (booking as any)?.lecturerId?.email || 'Lecturer';

    const approverIds = await this.findBookingApproverIds(campusId);
    const recipients = approverIds.filter(
      (id) => id !== this.extractObjectId((booking as any)?.lecturerId?._id || (booking as any)?.lecturerId),
    );

    if (recipients.length === 0) {
      this.logger.warn(`No booking reminder recipients found for campus ${campusId}`);
      return;
    }

    await this.createAndBroadcastMany(
      recipients.map((recipientId) => ({
        recipientId,
        campusId,
        senderId: null,
        type: 'booking_pending_reminder',
        title: `Booking approval reminder: ${roomCode}`,
        message: `${requesterName}'s booking is still pending approval`,
        priority: 'high',
        data: {
          bookingId,
          roomCode,
          reminder: true,
        },
        dedupeKey: `booking-reminder:${bookingId}:recipient:${recipientId}`,
      })),
    );
  }

  async notifyBookingDecision(bookingPayload: any): Promise<void> {
    const status = bookingPayload?.status;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return;
    }

    const recipientId = this.extractObjectId(bookingPayload?.lecturerId?._id || bookingPayload?.lecturerId);
    const bookingId = this.extractObjectId(bookingPayload?._id);
    const campusId = this.extractObjectId(bookingPayload?.campusId);
    const roomCode = bookingPayload?.roomId?.roomCode || 'Unknown room';
    const rejectReason = String(bookingPayload?.rejectReason || '').trim();
    const bookingDate = bookingPayload?.bookingDate || null;
    const startTime = bookingPayload?.startTime || null;
    const endTime = bookingPayload?.endTime || null;

    if (!recipientId || !bookingId || !campusId) {
      return;
    }

    await this.createAndBroadcastMany([
      {
        recipientId,
        campusId,
        senderId: null,
        type: status === 'approved' ? 'booking_approved' : 'booking_rejected',
        title: status === 'approved' ? `Booking approved: ${roomCode}` : `Booking rejected: ${roomCode}`,
        message:
          status === 'approved'
            ? `Your booking request for room ${roomCode} has been approved`
            : rejectReason
              ? `Your booking request for room ${roomCode} was rejected. Reason: ${rejectReason}`
              : `Your booking request for room ${roomCode} has been rejected`,
        priority: status === 'approved' ? 'medium' : 'high',
        data: {
          bookingId,
          roomCode,
          status,
          rejectReason: rejectReason || null,
          bookingDate,
          startTime,
          endTime,
        },
        dedupeKey: `booking-decision:${status}:${bookingId}:recipient:${recipientId}`,
      },
    ]);
  }

  async cancelBookingReminder(bookingId: string): Promise<void> {
    await this.notificationsQueueService.cancelBookingReminder(bookingId);
  }

  async dispatchTransferCancelledNotification(transferPayload: any, currentUser: any): Promise<void> {
    const transferId = this.extractObjectId(transferPayload?._id || transferPayload?.id);

    if (!transferId) {
      return;
    }

    const payload: TransferCancelledJobPayload = {
      transferId,
      traceId:
        String(transferPayload?.traceId || '').trim() || `transfer-cancel-${transferId}-${Date.now()}`,
      status: String(transferPayload?.status || '').trim() || 'cancelled',
      campusId: this.extractObjectId(transferPayload?.campusId),
      fromUserId: this.extractObjectId(transferPayload?.fromUserId),
      toUserId: this.extractObjectId(transferPayload?.toUserId),
      actorId:
        this.extractObjectId(currentUser?._id || currentUser?.id) ||
        this.extractObjectId(transferPayload?.fromUserId),
      actorName:
        String(currentUser?.fullName || currentUser?.email || '').trim() ||
        String(transferPayload?.fromUserName || '').trim() ||
        null,
      roomId: this.extractObjectId(transferPayload?.roomId),
      lockerId: this.extractObjectId(transferPayload?.lockerId),
      fromScheduleId: this.extractObjectId(transferPayload?.fromScheduleId),
      toScheduleId: this.extractObjectId(transferPayload?.toScheduleId),
      transferDate: transferPayload?.transferDate || null,
      reason: String(transferPayload?.reason || '').trim() || null,
      notes: String(transferPayload?.notes || '').trim() || null,
    };

    // For cancel flow we prioritize immediate visibility over async queue processing.
    // Queue can still be opted in explicitly via env when needed.
    const useQueueForTransferCancel =
      this.notificationsQueueService.isEnabled() &&
      String(process.env.NOTIFICATION_TRANSFER_CANCEL_USE_QUEUE || 'false') === 'true';

    if (useQueueForTransferCancel) {
      try {
        const enqueued = await this.notificationsQueueService.enqueueTransferCancelled(payload);
        if (enqueued) {
          return;
        }

        this.logger.warn(
          `Transfer cancel notification queue unavailable. Falling back to direct dispatch for transfer ${transferId}.`,
        );
      } catch (error) {
        this.logger.warn(`Failed to enqueue transfer cancel notification job: ${error}`);
      }
    }

    await this.notifyTransferCancelledFromQueue(payload);
  }

  async notifyTransferCancelledFromQueue(payload: TransferCancelledJobPayload): Promise<void> {
    const transferPayload = {
      _id: payload.transferId,
      id: payload.transferId,
      campusId: payload.campusId || null,
      fromUserId: payload.fromUserId || null,
      toUserId: payload.toUserId || null,
      roomId: payload.roomId || null,
      lockerId: payload.lockerId || null,
      fromScheduleId: payload.fromScheduleId || null,
      toScheduleId: payload.toScheduleId || null,
      transferDate: payload.transferDate || null,
      status: String(payload.status || '').trim() || 'cancelled',
      reason: payload.reason || null,
      notes: payload.notes || null,
      traceId: payload.traceId || null,
    };

    const actor = {
      _id: payload.actorId || payload.fromUserId || null,
      fullName: payload.actorName || null,
    };

    await this.notifyTransferCancelled(transferPayload, actor);
  }

  private async notifyTransferCancelled(transferPayload: any, actor: any): Promise<void> {
    try {
      const transferId = this.extractObjectId(transferPayload?._id || transferPayload?.id);
      const traceId = String(transferPayload?.traceId || '').trim() || 'n/a';

      if (!transferId) {
        return;
      }

      const campusId = this.extractObjectId(transferPayload?.campusId);
      const fromUserId = this.extractObjectId(transferPayload?.fromUserId);
      const toUserId = this.extractObjectId(transferPayload?.toUserId);
      const roomId = this.extractObjectId(transferPayload?.roomId);
      const lockerId = this.extractObjectId(transferPayload?.lockerId);
      const transferStatus = String(transferPayload?.status || '').trim() || 'cancelled';
      const actorId =
        this.extractObjectId(actor?._id || actor?.id) ||
        fromUserId ||
        this.extractObjectId(transferPayload?.fromUserId);

      const actorName =
        String(actor?.fullName || actor?.email || '').trim() ||
        String(transferPayload?.fromUserName || '').trim() ||
        'User';

      const adminRecipientIds = campusId
        ? await this.findTransferAdminRecipientIds(campusId)
        : [];

      const recipients = Array.from(
        new Set([
          fromUserId,
          toUserId,
          actorId,
          ...adminRecipientIds,
        ].filter((id): id is string => Boolean(id))),
      );

      if (recipients.length === 0) {
        this.logger.warn(
          `[transfer-cancel-debug] No recipients for transfer cancel notification. traceId=${traceId}, transferId=${transferId}`,
        );
        return;
      }

      const normalizedCampusId = campusId && Types.ObjectId.isValid(campusId) ? campusId : null;

      await this.createAndBroadcastMany(
        recipients.map((recipientId) => ({
          recipientId,
          campusId: normalizedCampusId,
          senderId: actorId || null,
          type: 'transfer_cancelled',
          title: 'Transfer request has been cancelled',
          message: `${actorName} cancelled a transfer request`,
          priority: 'medium',
          data: {
            transferId,
            status: transferStatus,
            fromUserId,
            toUserId,
            roomId,
            lockerId,
            actorId,
            actorName,
            fromScheduleId: this.extractObjectId(transferPayload?.fromScheduleId),
            toScheduleId: this.extractObjectId(transferPayload?.toScheduleId),
            transferDate: transferPayload?.transferDate || null,
            reason: String(transferPayload?.reason || '').trim() || null,
            notes: String(transferPayload?.notes || '').trim() || null,
            traceId,
          },
          dedupeKey: `transfer-cancelled:${transferId}:recipient:${recipientId}`,
        })),
      );
    } catch (error) {
      this.logger.warn(`Failed to dispatch transfer cancelled notifications: ${error}`);
    }
  }

  private async findTransferAdminRecipientIds(campusId: string): Promise<string[]> {
    const adminRoleCodes = ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'TRAINING_OFFICER'];

    const roleRows = await this.roleModel
      .find({
        isActive: { $ne: false },
        roleCode: { $in: adminRoleCodes },
      })
      .select('_id roleCode')
      .lean()
      .exec();

    if (roleRows.length === 0) {
      return [];
    }

    const globalRoleIds = roleRows
      .filter((role: any) => String(role?.roleCode || '').toUpperCase() === 'SUPER_ADMIN')
      .map((role: any) => new Types.ObjectId(role._id));

    const campusRoleIds = roleRows
      .filter((role: any) => String(role?.roleCode || '').toUpperCase() !== 'SUPER_ADMIN')
      .map((role: any) => new Types.ObjectId(role._id));

    const userFilters: Record<string, any>[] = [];

    if (globalRoleIds.length > 0) {
      userFilters.push({ roleId: { $in: globalRoleIds } });
    }

    if (campusRoleIds.length > 0 && Types.ObjectId.isValid(campusId)) {
      userFilters.push({
        roleId: { $in: campusRoleIds },
        campusId: new Types.ObjectId(campusId),
      });
    }

    if (userFilters.length === 0) {
      return [];
    }

    const userRows = await this.userModel
      .find({
        isActive: { $ne: false },
        $or: userFilters,
      })
      .select('_id')
      .lean()
      .exec();

    return Array.from(new Set(userRows.map((row: any) => String(row?._id || '')))).filter(Boolean);
  }

  private async createAndBroadcastMany(items: CreateNotificationInput[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const mapped = items
      .map((item) => {
        const recipientId = this.extractObjectId(item.recipientId);
        const senderId = this.extractObjectId(item.senderId);
        const campusId = this.extractObjectId(item.campusId);

        if (!recipientId || !Types.ObjectId.isValid(recipientId)) {
          this.logger.warn(
            `Skip notification with invalid recipientId: ${String(item.recipientId || '')}`,
          );
          return null;
        }

        return {
          recipientId: new Types.ObjectId(recipientId),
          senderId: senderId && Types.ObjectId.isValid(senderId) ? new Types.ObjectId(senderId) : null,
          campusId: campusId && Types.ObjectId.isValid(campusId) ? new Types.ObjectId(campusId) : null,
          type: item.type,
          title: item.title,
          message: item.message,
          data: item.data || {},
          priority: item.priority || 'medium',
          isRead: false,
          readAt: null,
          dedupeKey: item.dedupeKey || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
      .filter(Boolean) as any[];

    if (mapped.length === 0) {
      this.logger.warn('No valid notification rows to insert after id normalization.');
      return;
    }

    let inserted: any[] = [];

    try {
      inserted = await this.notificationModel.insertMany(mapped, {
        ordered: false,
        lean: true,
      });
    } catch (error: any) {
      // Ignore duplicate-key rows and continue with successfully inserted docs
      if (error?.insertedDocs && Array.isArray(error.insertedDocs)) {
        inserted = error.insertedDocs;
      } else {
        throw error;
      }
    }

    for (const notification of inserted) {
      const payload = this.mapNotification(notification);
      this.eventsGateway.sendToUser(String(payload.recipientId), 'notification', payload);
    }
  }

  private async findBookingApproverIds(campusId: string): Promise<string[]> {
    const roleRows = await this.roleModel
      .find({
        isActive: { $ne: false },
        scope: { $in: ['CAMPUS', 'GLOBAL'] },
      })
      .select('_id scope')
      .lean()
      .exec();

    if (roleRows.length === 0) {
      return [];
    }

    const campusRoleIds = roleRows
      .filter((role: any) => String(role.scope || '').toUpperCase() === 'CAMPUS')
      .map((role: any) => new Types.ObjectId(role._id));

    const globalRoleIds = roleRows
      .filter((role: any) => String(role.scope || '').toUpperCase() === 'GLOBAL')
      .map((role: any) => new Types.ObjectId(role._id));

    const userOrConditions: Record<string, any>[] = [];

    if (campusRoleIds.length > 0) {
      userOrConditions.push({
        roleId: { $in: campusRoleIds },
        campusId: new Types.ObjectId(campusId),
      });
    }

    if (globalRoleIds.length > 0) {
      userOrConditions.push({
        roleId: { $in: globalRoleIds },
      });
    }

    if (userOrConditions.length === 0) {
      return [];
    }

    const userRows = await this.userModel
      .find({
        isActive: { $ne: false },
        $or: userOrConditions,
      })
      .select('_id')
      .lean()
      .exec();

    return Array.from(new Set(userRows.map((row: any) => row._id.toString())));
  }

  private getReminderDelayMs(): number {
    const min = Number(process.env.BOOKING_APPROVAL_REMINDER_MINUTES || 15);
    const max = Number(process.env.BOOKING_APPROVAL_REMINDER_MAX_MINUTES || 20);

    const safeMin = Number.isNaN(min) ? 15 : min;
    const safeMax = Number.isNaN(max) ? 20 : Math.max(max, safeMin);

    const delayMinutes = safeMin + Math.floor(Math.random() * (safeMax - safeMin + 1));
    return delayMinutes * 60 * 1000;
  }

  private mapNotification(item: any): any {
    return {
      _id: item?._id?.toString?.() || String(item?._id),
      recipientId: item?.recipientId?.toString?.() || String(item?.recipientId),
      senderId: item?.senderId ? item.senderId.toString() : null,
      campusId: item?.campusId ? item.campusId.toString() : null,
      type: item?.type,
      title: item?.title,
      message: item?.message,
      data: item?.data || {},
      priority: item?.priority || 'medium',
      isRead: Boolean(item?.isRead),
      readAt: item?.readAt || null,
      createdAt: item?.createdAt || new Date(),
      updatedAt: item?.updatedAt || new Date(),
    };
  }

  private extractObjectId(value: any): string | null {
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

    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (typeof value === 'object' && value._id) {
      return this.extractObjectId(value._id);
    }

    if (typeof value === 'object' && value.id) {
      return this.extractObjectId(value.id);
    }

    return null;
  }
}
