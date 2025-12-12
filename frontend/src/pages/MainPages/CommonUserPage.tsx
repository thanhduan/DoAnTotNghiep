import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const CommonUserPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Lịch học hôm nay', value: '3', icon: '📅', color: 'bg-blue-500' },
    { name: 'Phòng đã đặt', value: '5', icon: '📝', color: 'bg-green-500' },
    { name: 'Đang mượn', value: '1', icon: '🔑', color: 'bg-yellow-500' },
  ];

  const upcomingClasses = [
    { id: 1, subject: 'Lập trình Web', room: 'A101', time: '08:00 - 10:00', status: 'Sắp diễn ra' },
    { id: 2, subject: 'Cơ sở dữ liệu', room: 'B203', time: '10:15 - 12:15', status: 'Sắp diễn ra' },
    { id: 3, subject: 'Mạng máy tính', room: 'C301', time: '13:00 - 15:00', status: 'Sắp diễn ra' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Xin chào, {user?.fullName || 'User'}!
        </h1>
        <p className="text-primary-100">
          Chào mừng bạn đến với Hệ thống quản lý phòng học thông minh
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Campus:</span>
            <span className="font-semibold">{user?.campusId?.campusName || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {user?.role === 'lecturer' ? 'Mã GV:' : user?.role === 'student' ? 'Mã SV:' : 'Mã NV:'}
            </span>
            <span className="font-semibold">
              {user?.employeeId || user?.studentId || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming Classes */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.role === 'lecturer' ? 'Lịch giảng dạy hôm nay' : 'Lịch học hôm nay'}
            </h2>
          </div>
          
          <div className="space-y-4">
            {upcomingClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cls.subject}</h3>
                    <p className="text-sm text-gray-600">
                      Phòng {cls.room} • {cls.time}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {cls.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
              <span className="text-2xl">📝</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">Đặt phòng mới</p>
                <p className="text-sm text-gray-600">Đặt phòng học cho hoạt động</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <span className="text-2xl">📅</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">Xem lịch học</p>
                <p className="text-sm text-gray-600">Kiểm tra lịch học của bạn</p>
              </div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommonUserPage;
