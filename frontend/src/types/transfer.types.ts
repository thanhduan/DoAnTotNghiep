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
}

export interface TransferTargetOptionsResponse {
  options: TransferTargetOption[];
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
