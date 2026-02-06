import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import { LockerPayload, LockerEntity, LockerStatus } from '../../types/locker.type';
import { lockerService } from '../../services/locker.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (data: LockerPayload) => Promise<void>;
  locker?: LockerEntity;
  campuses: { _id: string; campusName: string }[]; // Ensure campuses is defined in Props
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
        solenoids: locker.solenoids ?? [], // Ensure solenoids are included
        esp32Id: locker.esp32Id ?? null, // Ensure esp32Id is included and matches updated type
      });
    }
  }, [locker]);

  if (!isOpen || !form) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};

    // Validate lockerNumber
    if (!form?.lockerNumber || form.lockerNumber < 1) {
      errs.lockerNumber = 'Số tủ phải lớn hơn 0';
    }

    // Validate position
    if (!form?.position || !form.position.trim()) {
      errs.position = 'Vị trí không được để trống';
    }

    // Validate campusId
    if (!form?.campusId) {
      errs.campusId = 'Vui lòng chọn cơ sở';
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
      deviceId: form.deviceId || '', // Ensure deviceId is always a string
      isActive: form.isActive,
      campusId: form.campusId,
      solenoids: form.solenoids ?? [], // Ensure solenoids are included
      esp32Id: form.esp32Id ?? null, // Ensure esp32Id is included and matches updated type
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
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Chỉnh Sửa Tủ Khóa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức Pin
            </label>
            <input
              type="number"
              value={form.batteryLevel}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái
            </label>
            <select
              value={form.status || 'available'}
              onChange={(e) => setForm({ ...form, status: e.target.value as LockerStatus })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              disabled={!isAdmin} // Restrict editing based on admin level
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
              disabled={!canRelocate} // Restrict editing based on relocation permissions
            >
              <option value="">Chưa gán cơ sở</option>
              {campuses?.map((campus: { _id: string; campusName: string }) => (
                <option key={campus._id} value={campus._id}>
                  {campus.campusName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã Thiết Bị
            </label>
            <input
              type="text"
              value={form.deviceId || 'N/A'}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
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

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh Sách Khóa Điện Tử
            </label>
            <div className="bg-gray-100 p-4 rounded-lg max-h-40 overflow-y-auto">
              {locker?.solenoids && locker.solenoids.length > 0 ? (
                <ul className="list-disc pl-5">
                  {locker.solenoids.map((solenoid, index) => (
                    <li key={index} className="text-gray-700">
                      Solenoid {index + 1}: 
                      <span className={solenoid.connected ? 'text-green-600' : 'text-red-600'}>
                        {solenoid.connected ? ' Kết nối' : ' Mất kết nối'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Không có khóa điện tử nào</p>
              )}
            </div>
          </div>
        </div>

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
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-md"
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditLockerModal;

const isAdmin = true; // Replace with actual logic to determine admin level
const canRelocate = true; // Replace with actual logic to determine relocation permissions