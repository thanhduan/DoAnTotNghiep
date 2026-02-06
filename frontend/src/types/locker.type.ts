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
  esp32Id: string | null; // Updated to ensure compatibility with EditLockerModal
  solenoids?: { id: string; connected: boolean }[]; // Added solenoids property inline
}

export interface LockerPayload {
  lockerNumber: number; // Ensure lockerNumber is a number
  position: string;
  batteryLevel: number;
  status: LockerStatus;
  deviceId: string;
  isActive: boolean;
  campusId: string | null;
  solenoids: { id: string; connected: boolean }[];
  esp32Id?: string | null; // Updated to allow null values for compatibility
  lastConnection?: string; // Re-added lastConnection to match existing service logic
}
