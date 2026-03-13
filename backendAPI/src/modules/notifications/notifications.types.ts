export type NotificationPriority = 'low' | 'medium' | 'high';

export interface CreateNotificationInput {
  recipientId: string;
  senderId?: string | null;
  campusId?: string | null;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  dedupeKey?: string;
}

export interface BookingReminderJobPayload {
  bookingId: string;
  campusId: string;
}

export interface TransferCancelledJobPayload {
  transferId: string;
  traceId?: string | null;
  status?: string | null;
  campusId?: string | null;
  fromUserId?: string | null;
  toUserId?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  roomId?: string | null;
  lockerId?: string | null;
  fromScheduleId?: string | null;
  toScheduleId?: string | null;
  transferDate?: string | Date | null;
  reason?: string | null;
  notes?: string | null;
}
