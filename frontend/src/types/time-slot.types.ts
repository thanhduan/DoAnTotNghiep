export interface TimeSlot {
  _id: string;
  id?: string; // For compatibility
  slotType: 'OLDSLOT' | 'NEWSLOT';
  slotNumber: number;
  slotName: string;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  description?: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateTimeSlotDto {
  slotType: 'OLDSLOT' | 'NEWSLOT';
  slotNumber: number;
  slotName: string;
  startTime: string;
  endTime: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTimeSlotDto {
  slotType?: 'OLDSLOT' | 'NEWSLOT';
  slotNumber?: number;
  slotName?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  isActive?: boolean;
}

export interface FilterTimeSlotDto {
  slotType?: 'OLDSLOT' | 'NEWSLOT';
  isActive?: boolean;
}

export interface TimeSlotStatistics {
  total: number;
  active: number;
  inactive: number;
  bySlotType: {
    OLDSLOT: number;
    NEWSLOT: number;
  };
}
