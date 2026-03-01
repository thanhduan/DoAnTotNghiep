import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Schedule } from '../../types/schedule.types';
import PermissionGuard from '../PermissionGuard';
import { PERMISSIONS } from '../../utils/permissions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  schedule: Schedule | null;
}

const ViewScheduleModal: React.FC<Props> = ({ isOpen, onClose, onEdit, schedule }) => {
  if (!schedule) return null;

  const room = typeof schedule.roomId === 'object' ? schedule.roomId : null;
  const lecturer = typeof schedule.lecturerId === 'object' ? schedule.lecturerId : null;
  const createdBy = typeof schedule.createdBy === 'object' ? schedule.createdBy : null;

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDayOfWeekName = (day: number): string => {
    const days = ['', '', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[day] || `Ngày ${day}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Lịch học</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Mã lớp</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                {schedule.classCode || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mã môn học</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                {schedule.subjectCode || 'N/A'}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Tên môn học</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                {schedule.subjectName || 'N/A'}
              </div>
            </div>
          </div>

          {/* Room Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Thông tin Phòng học</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Mã phòng</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {room?.roomCode || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tên phòng</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {room?.roomName || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tòa nhà</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {room?.building || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Lecturer Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Thông tin Giảng viên</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tên giảng viên</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {lecturer?.fullName || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {lecturer?.email || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Thông tin Lịch học</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {formatDate(schedule.dateStart)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Thứ trong tuần</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {getDayOfWeekName(schedule.dayOfWeek)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Loại tiết</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {schedule.slotType === 'OLDSLOT' ? 'Tiết cũ' : 'Tiết mới'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Số tiết</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {schedule.slotNumber}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Giờ bắt đầu</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {schedule.startTime}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Giờ kết thúc</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {schedule.endTime}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Học kỳ</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                  {schedule.semester || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      schedule.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : schedule.status === 'ongoing'
                        ? 'bg-green-100 text-green-800'
                        : schedule.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {schedule.status === 'scheduled'
                      ? 'Đã lên lịch'
                      : schedule.status === 'ongoing'
                      ? 'Đang diễn ra'
                      : schedule.status === 'completed'
                      ? 'Đã hoàn thành'
                      : 'Đã hủy'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Created By */}
          {createdBy && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Thông tin Tạo lịch</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Người tạo</label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                    {createdBy.fullName}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded border">
                    {createdBy.email}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <PermissionGuard permissions={[PERMISSIONS.SCHEDULES_UPDATE]}>
            <Button onClick={onEdit}>Chỉnh sửa</Button>
          </PermissionGuard>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewScheduleModal;
