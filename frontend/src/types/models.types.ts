export interface Room {
  id: string;
  roomCode: string;
  roomName: string;
  building: string;
  floor: number;
  capacity: number;
  roomType: 'classroom' | 'lab' | 'meeting_room';
  facilities: string[];
  lockerNumber?: number;
  status: 'available' | 'in_use' | 'maintenance';
  description?: string;
}

export interface Locker {
  id: string;
  lockerNumber: number;
  position: string;
  deviceId: string;
  status: 'available' | 'occupied' | 'maintenance';
  batteryLevel: number;
  lastConnection: Date;
}

export interface TimeSlot {
  id: string;
  slotType: 'OLDSLOT' | 'NEWSLOT';
  slotNumber: number;
  slotName: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface Schedule {
  id: string;
  roomId: string;
  teacherId: string;
  subjectCode: string;
  subjectName: string;
  classCode: string;
  dayOfWeek: number; // 2-8 (Mon-Sun)
  slotType: 'OLDSLOT' | 'NEWSLOT';
  slotNumber: number;
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
  semester: string;
  academicYear: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Booking {
  id: string;
  scheduleId?: string;
  roomId: string;
  userId: string;
  lockerNumber: number;
  borrowTime?: Date;
  plannedBorrowTime: Date;
  borrowMethod?: 'face' | 'fingerprint';
  returnTime?: Date;
  plannedReturnTime: Date;
  returnMethod?: 'face' | 'fingerprint';
  status: 'borrowing' | 'returned' | 'overdue';
  notes?: string;
}

export interface Campus {
  _id: string;
  campusCode: string;
  campusName: string;
  address: string;
  isActive: boolean;
}

export interface UserListItem {
  _id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'admin' | 'training_staff' | 'lecturer' | 'student';
  employeeId?: string;
  studentId?: string;
  department?: string;
  phone?: string;
  campusId?: Campus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

