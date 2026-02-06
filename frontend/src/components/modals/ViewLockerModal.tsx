import React from 'react';
import Button from '../common/Button';
import { LockerEntity } from '../../types/locker.type';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  locker?: LockerEntity;
}

const ViewLockerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onEdit,
  locker,
}) => {
  if (!isOpen || !locker) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Xem Tủ Khóa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số Tủ
            </label>
            <input
              type="text"
              value={locker.lockerNumber}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vị Trí
            </label>
            <input
              type="text"
              value={locker.position}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức Pin
            </label>
            <input
              type="number"
              value={locker.batteryLevel}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái
            </label>
            <select
              value={locker.status}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            >
              <option value="available">Có sẵn</option>
              <option value="occupied">Đang sử dụng</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cơ Sở
            </label>
            <select
              value={locker.campusId || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            >
              <option value="">Chưa gán cơ sở</option>
              {locker.campusName && <option value={locker.campusId || ''}>{locker.campusName}</option>}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã Thiết Bị
            </label>
            <input
              type="text"
              value={locker.deviceId || locker.esp32Id || 'N/A'}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái Hoạt Động
            </label>
            <select
              value={locker.isActive ? 'active' : 'inactive'}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh Sách Khóa Điện Tử (Tổng số: {locker.solenoids?.length || 0})
            </label>
            <div className="bg-gray-100 p-4 rounded-lg max-h-40 overflow-y-auto">
              {locker.solenoids && locker.solenoids.length > 0 ? (
                <ul className="list-disc pl-5">
                  {locker.solenoids.map((solenoid, index) => (
                    <li key={index} className="text-gray-700">
                      Khóa {index + 1}: 
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
            onClick={onEdit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md"
          >
            Chỉnh Sửa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewLockerModal;
