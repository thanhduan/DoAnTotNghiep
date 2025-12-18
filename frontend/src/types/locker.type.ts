export type LockerStatus = 'available' | 'occupied' | 'maintenance';

export interface LockerEntity {
  _id?: string; // Optional _id property for API compatibility
  id: string;
  lockerNumber: number;
  position: string;
  deviceId: string | null;
  campusId: string | null;
  campusName: string;
  status: LockerStatus;
  batteryLevel: number;
  isActive: boolean;
  lastConnection: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LockerPayload {
  lockerNumber: number;
  position: string;
  deviceId?: string | null;
  campusId?: string | null;
  status?: LockerStatus;
  batteryLevel?: number;
  isActive?: boolean;
  lastConnection?: string | null;
}
