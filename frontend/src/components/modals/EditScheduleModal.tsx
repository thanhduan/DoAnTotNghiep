import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
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
import { scheduleService, UpdateScheduleDto } from '../../services/schedule.service';
import roomService from '../../services/room.service';
import { timeSlotService } from '../../services/time-slot.service';
import { userService } from '../../services/user.service';
import { Room } from '../../types/room.types';
import { TimeSlot } from '../../types/time-slot.types';
import { Schedule } from '../../types/schedule.types';
import { UserListItem } from '../../types/models.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  schedule: Schedule | null;
}

const EditScheduleModal: React.FC<Props> = ({ isOpen, onClose, onUpdate, schedule }) => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [lecturers, setLecturers] = useState<UserListItem[]>([]);
  
  const [form, setForm] = useState<UpdateScheduleDto>({
    roomId: '',
    lecturerId: '',
    dateStart: '',
    dayOfWeek: undefined,
    slotType: undefined,
    slotNumber: undefined,
    startTime: '',
    endTime: '',
    classCode: '',
    subjectCode: '',
    subjectName: '',
    semester: '',
    status: 'scheduled',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen && schedule) {
      fetchData();
      const roomId = typeof schedule.roomId === 'string' ? schedule.roomId : schedule.roomId?._id || '';
      const lecturerId = typeof schedule.lecturerId === 'string' ? schedule.lecturerId : schedule.lecturerId?._id || '';
      const dateStart = typeof schedule.dateStart === 'string' 
        ? schedule.dateStart.split('T')[0]
        : new Date(schedule.dateStart).toISOString().split('T')[0];

      setForm({
        roomId,
        lecturerId,
        dateStart,
        dayOfWeek: schedule.dayOfWeek,
        slotType: schedule.slotType,
        slotNumber: schedule.slotNumber,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        classCode: schedule.classCode || '',
        subjectCode: schedule.subjectCode || '',
        subjectName: schedule.subjectName || '',
        semester: schedule.semester || '',
        status: schedule.status,
      });
    }
  }, [isOpen, schedule]);

  const fetchData = async () => {
    try {
      const [roomsData, slotsData, usersData] = await Promise.all([
        roomService.getAllRooms({ isActive: true }),
        timeSlotService.getAll({ isActive: true }),
        userService.getAll(),
      ]);

      setRooms(roomsData);
      setTimeSlots(slotsData);
      
      const activeLecturers = usersData.filter(user => {
        if (!user.isActive) return false;
        if (!user.roleId) return false;
        
        const roleCode = typeof user.roleId === 'string' 
          ? user.roleId 
          : user.roleId.roleCode || '';
        const roleName = typeof user.roleId === 'string'
          ? ''
          : user.roleId.roleName || '';
        
        return roleCode.toUpperCase() === 'LECTURER' || 
               roleName.toLowerCase().includes('giảng viên');
      });
      
      setLecturers(activeLecturers);
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

    // start < end
    if (form.startTime && form.endTime) {
      const [sh, sm] = form.startTime.split(':').map(Number);
      const [eh, em] = form.endTime.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      if (startMinutes >= endMinutes) {
        errs.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!schedule || !validate()) return;

    try {
      setLoading(true);
      const scheduleId = schedule._id || schedule.id;
      if (!scheduleId) {
        toast.error('Không tìm thấy ID lịch học');
        return;
      }

      const updatePayload: any = {
        dateStart: form.dateStart,
        dayOfWeek: form.dayOfWeek,
        slotType: form.slotType,
        slotNumber: form.slotNumber,
        startTime: form.startTime,
        endTime: form.endTime,
        classCode: form.classCode,
        subjectCode: form.subjectCode,
        subjectName: form.subjectName,
        semester: form.semester,
        status: form.status,
      };

      const originalRoomId = typeof schedule.roomId === 'string' ? schedule.roomId : schedule.roomId?._id;
      if (form.roomId && form.roomId !== originalRoomId) {
        updatePayload.roomId = form.roomId;
      }

      const originalLecturerId = typeof schedule.lecturerId === 'string' ? schedule.lecturerId : schedule.lecturerId?._id;
      if (form.lecturerId && form.lecturerId !== originalLecturerId) {
        updatePayload.lecturerId = form.lecturerId;
      }

      await scheduleService.update(scheduleId, updatePayload);
      toast.success('Cập nhật lịch học thành công');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast.error(error?.message || 'Cập nhật lịch học thất bại');
    } finally {
      setLoading(false);
    }
  };

  const selectedSlot = timeSlots.find(
    (s) => s.slotNumber === form.slotNumber && s.slotType === form.slotType
  );

  const filteredSlots = form.slotType
    ? timeSlots.filter((s) => s.slotType === form.slotType)
    : timeSlots;

  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Lịch học</DialogTitle>
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
                  <SelectItem key={room._id} value={room._id|| ''}>
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
                  slotNumber: undefined,
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
          {form.slotType && (
            <div>
              <Label htmlFor="slotNumber">Số tiết *</Label>
              <Select
                value={timeSlots.find((s) => s.slotNumber === form.slotNumber && s.slotType === form.slotType)?._id || ''}
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
          )}

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

          {/* Status */}
          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditScheduleModal;
