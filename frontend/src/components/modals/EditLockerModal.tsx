import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import { LockerPayload, LockerEntity, LockerStatus } from '../../types/locker.type';
import { lockerService } from '../../services/locker.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (data: LockerPayload) => Promise<void>;
  locker?: LockerEntity;
  campuses: { _id: string; campusName: string }[];
}

const EditLockerModal: React.FC<Props> = ({ isOpen, onClose, onEdit, locker, campuses }) => {
  const [form, setForm] = useState<LockerPayload | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (locker) {
      setForm({
        lockerNumber: locker.lockerNumber,
        position: locker.position,
        status: locker.status,
        batteryLevel: locker.batteryLevel,
        deviceId: locker.deviceId ?? '',
        isActive: locker.isActive,
        campusId: locker.campusId ?? null,
      });
    }
  }, [locker]);

  if (!isOpen || !form) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};

    // Validate lockerNumber
    if (!form.lockerNumber || form.lockerNumber < 1) {
      errs.lockerNumber = 'Số tủ phải lớn hơn 0';
    }

    // Validate position
    if (!form.position.trim()) {
      errs.position = 'Vị trí không được để trống';
    }

    // Validate batteryLevel
    if (form.batteryLevel === undefined || form.batteryLevel < 0 || form.batteryLevel > 100) {
      errs.batteryLevel = 'Pin phải từ 0 đến 100';
    }

    // Validate campusId
    if (!form.campusId) {
      errs.campusId = 'Vui lòng chọn cơ sở';
    }

    // Validate deviceId
    if (!form.deviceId || !form.deviceId.trim()) {
      errs.deviceId = 'Mã thiết bị không được để trống';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: LockerPayload = {
      lockerNumber: form.lockerNumber,
      position: form.position,
      status: form.status,
      batteryLevel: form.batteryLevel,
      deviceId: form.deviceId || null,
      isActive: form.isActive,
      campusId: form.campusId,
    };

    // Check for duplicates
    const existingLockers: LockerEntity[] = await lockerService.getAll();
    const foundDuplicates = existingLockers.filter(
      (locker) =>
        locker.id !== locker?.id && // Loại trừ chính bản ghi đang chỉnh sửa
        (
          locker.lockerNumber === form.lockerNumber ||
          locker.position.toLowerCase() === form.position.toLowerCase() ||
          locker.deviceId === form.deviceId // Thêm kiểm tra trùng mã thiết bị
        )
    );

    if (foundDuplicates.length > 0) {
      alert('Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại.');
      return;
    }

    await onEdit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Chỉnh Sửa Tủ Khóa
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số Tủ
            </label>
            <input
              type="number"
              value={form.lockerNumber}
              onChange={(e) => setForm({ ...form, lockerNumber: +e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.lockerNumber && <p className="text-red-500 text-sm">{errors.lockerNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vị Trí
            </label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức Pin
            </label>
            <input
              type="number"
              value={form.batteryLevel}
              onChange={(e) => setForm({ ...form, batteryLevel: +e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.batteryLevel && <p className="text-red-500 text-sm">{errors.batteryLevel}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LockerStatus })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cơ Sở
            </label>
            <select
              value={form.campusId || ''}
              onChange={(e) => setForm({ ...form, campusId: e.target.value || null })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chưa gán cơ sở</option>
              {campuses.map((campus) => (
                <option key={campus._id} value={campus._id}>
                  {campus.campusName}
                </option>
              ))}
            </select>
            {errors.campusId && <p className="text-red-500 text-sm">{errors.campusId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã Thiết Bị
            </label>
            <input
              type="text"
              value={form.deviceId || ''}
              onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.deviceId && <p className="text-red-500 text-sm">{errors.deviceId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái Hoạt Động
            </label>
            <select
              value={form.isActive ? 'true' : 'false'}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>
        </form>

        <div className="flex justify-center gap-4 mt-6">
          <Button
            onClick={onClose}
            variant="secondary"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md"
          >
            Đóng
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow-md"
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditLockerModal;
