import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Phòng học">
          <p className="text-gray-600 mb-4">Quản lý phòng học và thiết bị</p>
          <Button variant="primary" size="sm">
            Xem chi tiết
          </Button>
        </Card>

        <Card title="Lịch học">
          <p className="text-gray-600 mb-4">Quản lý lịch giảng dạy</p>
          <Button variant="primary" size="sm">
            Xem chi tiết
          </Button>
        </Card>

        <Card title="Mượn - Trả">
          <p className="text-gray-600 mb-4">Lịch sử mượn trả phòng học</p>
          <Button variant="primary" size="sm">
            Xem chi tiết
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
