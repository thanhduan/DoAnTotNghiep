import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'react-toastify';
import { scheduleService, CreateScheduleDto } from '../../services/schedule.service';
import roomService from '../../services/room.service';
import { timeSlotService } from '../../services/time-slot.service';
import { userService } from '../../services/user.service';
import { Room } from '../../types/room.types';
import { TimeSlot } from '../../types/time-slot.types';
import { UserListItem } from '../../types/models.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  cellData: { roomId: string; slotNumber: number; slotType: 'OLDSLOT' | 'NEWSLOT' } | null;
  selectedDate: Date;
}

const CreateScheduleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreate,
  cellData,
  selectedDate,
}) => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [lecturers, setLecturers] = useState<UserListItem[]>([]);
  
  const [form, setForm] = useState<CreateScheduleDto>({
    roomId: '',
    lecturerId: '',
    dateStart: selectedDate.toISOString().split('T')[0],
    dayOfWeek: selectedDate.getDay() === 0 ? 7 : selectedDate.getDay() === 1 ? 2 : selectedDate.getDay() + 1,
    slotType: 'OLDSLOT',
    slotNumber: 1,
    startTime: '',
    endTime: '',
    classCode: '',
    subjectCode: '',
    subjectName: '',
    semester: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (cellData) {
        setForm((prev) => ({
          ...prev,
          roomId: cellData.roomId,
          slotNumber: cellData.slotNumber,
          slotType: cellData.slotType,
        }));
      }
    }
  }, [isOpen, cellData]);

  const fetchData = async () => {
    try {
      const [roomsData, slotsData, lecturersData] = await Promise.all([
        roomService.getAllRooms({ isActive: true }),
        timeSlotService.getAll({ isActive: true }),
        userService.getAll({ isActive: true }),
      ]);

      setRooms(roomsData);
      setTimeSlots(slotsData);
      setLecturers(lecturersData);

      // Set default time slot if cellData is provided
      if (cellData) {
        const matchingSlot = slotsData.find(
          (s) => s.slotNumber === cellData.slotNumber && s.slotType === cellData.slotType
        );
        if (matchingSlot) {
          setForm((prev) => ({
            ...prev,
            timeSlotId: matchingSlot._id || matchingSlot.id,
            startTime: matchingSlot.startTime,
            endTime: matchingSlot.endTime,
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const handleSlotChange = (slotId: string) => {
    const slot = timeSlots.find((s) => (s._id || s.id) === slotId);
    if (slot) {
      setForm((prev) => ({
        ...prev,
        slotNumber: slot.slotNumber,
        slotType: slot.slotType,
        timeSlotId: slot._id || slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
    }
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!form.roomId) errs.roomId = 'Vui lòng chọn phòng học';
    if (!form.lecturerId) errs.lecturerId = 'Vui lòng chọn giảng viên';
    if (!form.dateStart) errs.dateStart = 'Vui lòng chọn ngày';
    if (!form.startTime) errs.startTime = 'Vui lòng nhập giờ bắt đầu';
    if (!form.endTime) errs.endTime = 'Vui lòng nhập giờ kết thúc';
    if (!form.classCode?.trim()) errs.classCode = 'Vui lòng nhập mã lớp';
    if (!form.subjectName?.trim()) errs.subjectName = 'Vui lòng nhập tên môn học';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const selectedSlot = timeSlots.find(
    (s) => s.slotNumber === form.slotNumber && s.slotType === form.slotType
  );

  const filteredSlots = timeSlots.filter((s) => s.slotType === form.slotType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Lịch học mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Room Selection */}
          <div>
            <Label htmlFor="roomId">Phòng học *</Label>
            <Select
              value={form.roomId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, roomId: value }))}
            >
              <SelectTrigger id="roomId">
                <SelectValue placeholder="Chọn phòng học" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room._id} value={room._id || ''}>
                    {room.roomCode} - {room.roomName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && <p className="text-sm text-red-500 mt-1">{errors.roomId}</p>}
          </div>

          {/* Lecturer Selection */}
          <div>
            <Label htmlFor="lecturerId">Giảng viên *</Label>
            <Select
              value={form.lecturerId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, lecturerId: value }))}
            >
              <SelectTrigger id="lecturerId">
                <SelectValue placeholder="Chọn giảng viên" />
              </SelectTrigger>
              <SelectContent>
                {lecturers.map((lecturer) => (
                  <SelectItem key={lecturer._id} value={lecturer._id}>
                    {lecturer.fullName} ({lecturer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lecturerId && <p className="text-sm text-red-500 mt-1">{errors.lecturerId}</p>}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="dateStart">Ngày bắt đầu *</Label>
            <Input
              id="dateStart"
              type="date"
              value={form.dateStart}
              onChange={(e) => {
                const date = new Date(e.target.value);
                const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay() === 1 ? 2 : date.getDay() + 1;
                setForm((prev) => ({
                  ...prev,
                  dateStart: e.target.value,
                  dayOfWeek,
                }));
              }}
            />
            {errors.dateStart && <p className="text-sm text-red-500 mt-1">{errors.dateStart}</p>}
          </div>

          {/* Slot Type */}
          <div>
            <Label htmlFor="slotType">Loại tiết *</Label>
            <Select
              value={form.slotType}
              onValueChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  slotType: value as 'OLDSLOT' | 'NEWSLOT',
                  slotNumber: 1,
                }));
              }}
            >
              <SelectTrigger id="slotType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OLDSLOT">Tiết cũ</SelectItem>
                <SelectItem value="NEWSLOT">Tiết mới</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Slot Number */}
          <div>
            <Label htmlFor="slotNumber">Số tiết *</Label>
            <Select
              value={form.timeSlotId || ''}
              onValueChange={handleSlotChange}
            >
              <SelectTrigger id="slotNumber">
                <SelectValue placeholder="Chọn tiết học" />
              </SelectTrigger>
              <SelectContent>
                {filteredSlots.map((slot) => (
                  <SelectItem key={slot._id || slot.id} value={slot._id || slot.id || ''}>
                    {slot.slotName} ({slot.startTime} - {slot.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSlot && (
              <p className="text-sm text-gray-500 mt-1">
                Tiết {selectedSlot.slotNumber}: {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Giờ bắt đầu *</Label>
              <Input
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />
              {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <Label htmlFor="endTime">Giờ kết thúc *</Label>
              <Input
                id="endTime"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
              {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Class Code */}
          <div>
            <Label htmlFor="classCode">Mã lớp *</Label>
            <Input
              id="classCode"
              value={form.classCode}
              onChange={(e) => setForm((prev) => ({ ...prev, classCode: e.target.value }))}
              placeholder="VD: SE1801"
            />
            {errors.classCode && <p className="text-sm text-red-500 mt-1">{errors.classCode}</p>}
          </div>

          {/* Subject Code */}
          <div>
            <Label htmlFor="subjectCode">Mã môn học</Label>
            <Input
              id="subjectCode"
              value={form.subjectCode}
              onChange={(e) => setForm((prev) => ({ ...prev, subjectCode: e.target.value }))}
              placeholder="VD: PRN231"
            />
          </div>

          {/* Subject Name */}
          <div>
            <Label htmlFor="subjectName">Tên môn học *</Label>
            <Input
              id="subjectName"
              value={form.subjectName}
              onChange={(e) => setForm((prev) => ({ ...prev, subjectName: e.target.value }))}
              placeholder="VD: Lập trình .NET"
            />
            {errors.subjectName && <p className="text-sm text-red-500 mt-1">{errors.subjectName}</p>}
          </div>

          {/* Semester */}
          <div>
            <Label htmlFor="semester">Học kỳ</Label>
            <Input
              id="semester"
              value={form.semester}
              onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
              placeholder="VD: Spring2025"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleModal;
