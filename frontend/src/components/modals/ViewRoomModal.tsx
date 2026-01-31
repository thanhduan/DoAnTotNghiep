import React from 'react';
import { Room } from '../../types/room.types';
import { Device } from '../../types/device.types';

interface ViewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  onStatusChange?: (id: string, status: string) => void;
}

const ViewRoomModal: React.FC<ViewRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  onStatusChange,
}) => {
  if (!isOpen) return null;

  const getCampusName = () => {
    if (typeof room.campusId === 'object') {
      return room.campusId.campusName;
    }
    return room.campusId;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { text: 'Khả dụng', className: 'bg-green-100 text-green-800' },
      occupied: { text: 'Đang sử dụng', className: 'bg-blue-100 text-blue-800' },
      maintenance: { text: 'Bảo trì', className: 'bg-yellow-100 text-yellow-800' },
      reserved: { text: 'Đã đặt', className: 'bg-purple-100 text-purple-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const getDeviceStatusBadge = (status: string) => {
    const statusConfig = {
      ok: { text: 'Hoạt động', className: 'bg-emerald-100 text-emerald-800' },
      broken: { text: 'Hư hỏng', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ok;
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const devices = (room.devices || []) as Device[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Chi tiết Phòng học</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Mã phòng</label>
              <p className="text-lg font-semibold">{room.roomCode}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Tên phòng</label>
              <p className="text-lg font-semibold">{room.roomName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Tòa nhà</label>
              <p className="text-lg">Tòa {room.building}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Tầng</label>
              <p className="text-lg">Tầng {room.floor}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Loại phòng</label>
              <p className="text-lg">{room.roomType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Sức chứa</label>
              <p className="text-lg">{room.capacity} người</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Số tủ khóa</label>
              <p className="text-lg">{room.lockerNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Campus</label>
              <p className="text-lg">{getCampusName()}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Thiết bị trong phòng
            </label>
            {devices.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Mã thiết bị</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Tên thiết bị</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Số lượng</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {devices.map((device) => (
                      <tr key={device._id}>
                        <td className="px-3 py-2 font-medium text-gray-700">{device.deviceCode}</td>
                        <td className="px-3 py-2 text-gray-700">{device.deviceName}</td>
                        <td className="px-3 py-2 text-gray-700">{device.quantity}</td>
                        <td className="px-3 py-2">{getDeviceStatusBadge(device.deviceStatus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 italic">Chưa có thiết bị nào</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Trạng thái
            </label>
            <div className="flex items-center space-x-4">
              {getStatusBadge(room.status)}
              
            </div>
          </div>

          {room.description && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Mô tả</label>
              <p className="text-gray-700">{room.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Trạng thái hoạt động</label>
              <p className="text-lg">
                {room.isActive ? (
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">Đang hoạt động</span>
                ) : (
                  <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">Không hoạt động</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <label className="block font-medium">Ngày tạo</label>
              <p>{new Date(room.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <label className="block font-medium">Cập nhật lần cuối</label>
              <p>{new Date(room.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRoomModal;
