import React, { useState } from 'react';
import Button from '../common/Button';
import { LockerPayload, LockerStatus, LockerEntity } from '../../types/locker.type';
import { lockerService } from '../../services/locker.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: LockerPayload) => void;
  onUpdate: (id: string, data: LockerPayload) => Promise<void>;
  campuses: { _id: string; campusName: string }[];
}

const CreateLockerModal: React.FC<Props> = ({ isOpen, onClose, onCreate, onUpdate, campuses }) => {
  const [form, setForm] = useState<LockerPayload>({
    lockerNumber: 0,
    position: '',
    batteryLevel: 100,
    status: 'available',
    deviceId: '',
    isActive: true,
    campusId: null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [duplicates, setDuplicates] = useState<LockerEntity[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  if (!isOpen) return null;

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
    if (form.batteryLevel !== undefined && (form.batteryLevel < 0 || form.batteryLevel > 100)) {
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

    try {
      // Check for duplicate lockers
      const existingLockers: LockerEntity[] = await lockerService.getAll();
      const foundDuplicates = existingLockers.filter(
        (locker) =>
          locker.lockerNumber === form.lockerNumber ||
          locker.position.toLowerCase() === form.position.toLowerCase() ||
          locker.deviceId === form.deviceId // Thêm kiểm tra trùng mã thiết bị
      );

      if (foundDuplicates.length > 0) {
        setDuplicates(foundDuplicates);
        setShowDuplicateModal(true);
        return;
      }

      // Proceed with creation if no duplicates
      await onCreate(form);
      setForm({
        lockerNumber: 0,
        position: '',
        batteryLevel: 100,
        status: 'available',
        deviceId: '',
        isActive: true,
        campusId: null,
      });
      onClose();
    } catch (error) {
      console.error('Error during submission:', error);
      alert('Đã xảy ra lỗi khi tạo hoặc cập nhật tủ.');
    }
  };

  const handleUpdateDuplicate = async (duplicate: LockerEntity) => {
    try {
      await onUpdate(duplicate.id, form);
      setShowDuplicateModal(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại');
    }
  };

  const handleLockerNumberChange = (value: string) => {
    const sanitizedValue = value.replace(/^0+/, ''); // Remove leading zeros
    setForm({ ...form, lockerNumber: sanitizedValue ? parseInt(sanitizedValue, 10) : 0 });
  };

  const handleBatteryLevelChange = (value: string) => {
    const sanitizedValue = value.replace(/^0+/, ''); // Remove leading zeros
    setForm({ ...form, batteryLevel: sanitizedValue ? parseInt(sanitizedValue, 10) : 0 });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 border-b pb-4">
          Tạo Tủ Khóa
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số Tủ
            </label>
            <input
              type="number"
              value={form.lockerNumber || ''}
              onChange={(e) => handleLockerNumberChange(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 shadow-sm ${form.lockerNumber === 0 ? 'text-gray-400' : 'text-black'
                }`}
              placeholder="0"
            />
            {errors.lockerNumber && <p className="text-red-500 text-sm mt-1">{errors.lockerNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vị Trí
            </label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Nhập vị trí"
            />
            {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mức Pin
            </label>
            <input
              type="number"
              value={form.batteryLevel}
              onChange={(e) => handleBatteryLevelChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.batteryLevel && <p className="text-red-500 text-sm mt-1">{errors.batteryLevel}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng Thái
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LockerStatus })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cơ Sở
            </label>
            <select
              value={form.campusId || ''}
              onChange={(e) => setForm({ ...form, campusId: e.target.value || null })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="">-- Chọn Cơ Sở --</option>
              {campuses.map((campus) => (
                <option key={campus._id} value={campus._id}>
                  {campus.campusName}
                </option>
              ))}
            </select>
            {errors.campusId && <p className="text-red-500 text-sm mt-1">{errors.campusId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã Thiết Bị
            </label>
            <input
              type="text"
              value={form.deviceId || ''}
              onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Nhập mã thiết bị"
            />
            {errors.deviceId && <p className="text-red-500 text-sm mt-1">{errors.deviceId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng Thái Hoạt Động
            </label>
            <select
              value={form.isActive ? 'true' : 'false'}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>
        </form>

        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={onClose}
            variant="secondary"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow-md"
          >
            Đóng
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded shadow-md"
          >
            Tạo
          </Button>
        </div>
      </div>

      {showDuplicateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Thông Tin Trùng Lặp</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Số Tủ</th>
                  <th className="px-4 py-2 border">Vị Trí</th>
                  <th className="px-4 py-2 border">Cơ Sở</th>
                  <th className="px-4 py-2 border">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.map((dup) => (
                  <tr key={dup.id}>
                    <td className="px-4 py-2 border text-center">{dup.lockerNumber}</td>
                    <td className="px-4 py-2 border text-center">{dup.position}</td>
                    <td className="px-4 py-2 border text-center">{dup.campusName}</td>
                    <td className="px-4 py-2 border text-center">
                      <div className="flex justify-center gap-6">
                        <Button
                          onClick={() => setShowDuplicateModal(false)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={() => handleUpdateDuplicate(dup)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded"
                        >
                          Cập Nhật
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLockerModal;
