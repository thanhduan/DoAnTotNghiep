export type TransferStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';

export interface TransferRecord {
  _id: string;
  roomId: string;
  lockerId: string;
  fromUserId: string;
  toUserId: string;
  campusId: string;
  fromScheduleId: string;
  toScheduleId: string;
  transferDate?: string;
  reason?: string;
  notes?: string;
  status: TransferStatus;
  approvedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  targetSchedule?: TransferTargetOption | null;
  targetLecturer?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | null;
}

export interface TransferTargetOption {
  scheduleId: string;
  lecturer: {
    _id?: string;
    fullName?: string;
    email?: string;
  };
  slotType: 'OLDSLOT' | 'NEWSLOT' | string;
  slotNumber: number;
  startTime: string;
  endTime: string;
  roomId?: string;
  roomCode?: string;
  transferDate?: string;
}

export interface TransferTargetOptionsResponse {
  options: TransferTargetOption[];
}

export interface TransferSourceSchedule {
  id: string;
  classCode: string;
  subjectCode: string;
  subjectName: string;
  dateStart?: string | null;
  startTime: string;
  endTime: string;
  slotType: 'OLDSLOT' | 'NEWSLOT' | string;
  slotNumber: number;
  roomId?: string;
  roomCode?: string;
  roomName?: string;
  building?: string;
}

export interface CreateTransferDto {
  roomId: string;
  lockerId: string;
  toUserId: string;
  fromScheduleId: string;
  toScheduleId: string;
  transferDate?: string;
  reason?: string;
  notes?: string;
}
