import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ReactPaginate from 'react-paginate';
import { AxiosError } from 'axios';
import { toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import roomService from '../../services/room.service';
import { campusService } from '../../services/campus.service';
import { Room, CreateRoomDto, UpdateRoomDto } from '../../types/room.types';
import CreateRoomModal from '../../components/modals/CreateRoomModal';
import EditRoomModal from '../../components/modals/EditRoomModal';
import ViewRoomModal from '../../components/modals/ViewRoomModal';

type Campus = {
  _id: string;
  campusName: string;
};

const RoomManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const [campusFilter, setCampusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [search, setSearch] = useState('');

  // =========================
  // Fetch rooms & campuses
  // =========================
  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, campusRes] = await Promise.all([
        roomService.getAllRooms(),
        campusService.getAll(),
      ]);
      setRooms(Array.isArray(roomRes) ? roomRes : []);
      setCampuses(Array.isArray(campusRes) ? campusRes : []);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Fetch error:', axiosError);
      toast.error('Không thể tải dữ liệu phòng học', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // Filter + search + pagination
  // =========================
  const filteredRooms = rooms.filter((room) => {
    const matchesCampus = campusFilter === 'all' || 
      (typeof room.campusId === 'object' ? room.campusId._id === campusFilter : room.campusId === campusFilter);
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || room.building === buildingFilter;
    const matchesSearch =
      room.roomCode.toLowerCase().includes(search.toLowerCase()) ||
      room.roomName.toLowerCase().includes(search.toLowerCase());
    return matchesCampus && matchesStatus && matchesBuilding && matchesSearch;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (a.building !== b.building) return a.building.localeCompare(b.building);
    if (a.floor !== b.floor) return a.floor - b.floor;
    return a.roomCode.localeCompare(b.roomCode);
  });

  const paginatedRooms = sortedRooms.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCount = Math.ceil(sortedRooms.length / itemsPerPage);

  // Get unique buildings
  const buildings = Array.from(new Set(rooms.map(r => r.building))).sort();

  // =========================
  // CRUD handlers
  // =========================
  const handleCreate = async (data: CreateRoomDto) => {
    try {
      await roomService.createRoom(data);
      toast.success('Tạo phòng học thành công!', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
      await fetchData();
      setIsCreateModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      toast.error(axiosError.response?.data?.message || 'Lỗi khi tạo phòng học', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    }
  };

  const handleEdit = async (id: string, data: UpdateRoomDto) => {
    try {
      await roomService.updateRoom(id, data);
      toast.success('Cập nhật phòng học thành công!', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
      await fetchData();
      setIsEditModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      toast.error(axiosError.response?.data?.message || 'Lỗi khi cập nhật phòng học', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng học này?')) return;
    try {
      await roomService.deleteRoom(id);
      toast.success('Xóa phòng học thành công!', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
      await fetchData();
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      toast.error(axiosError.response?.data?.message || 'Lỗi khi xóa phòng học', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await roomService.updateRoomStatus(id, status);
      toast.success('Cập nhật trạng thái thành công!', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
      await fetchData();
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    }
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
      <span className={`px-2 py-1 text-xs rounded-full ${config.className}`}>
        {config.text}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Phòng học</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          ➕ Thêm phòng học
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Mã hoặc tên phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campus
            </label>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              {campuses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.campusName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tòa nhà
            </label>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  Tòa {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              <option value="available">Khả dụng</option>
              <option value="occupied">Đang sử dụng</option>
              <option value="maintenance">Bảo trì</option>
              <option value="reserved">Đã đặt</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Tổng số phòng</p>
            <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Khả dụng</p>
            <p className="text-2xl font-bold text-green-600">
              {rooms.filter((r) => r.status === 'available').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Đang sử dụng</p>
            <p className="text-2xl font-bold text-blue-600">
              {rooms.filter((r) => r.status === 'occupied').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Bảo trì</p>
            <p className="text-2xl font-bold text-yellow-600">
              {rooms.filter((r) => r.status === 'maintenance').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Đã đặt</p>
            <p className="text-2xl font-bold text-purple-600">
              {rooms.filter((r) => r.status === 'reserved').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tòa/Tầng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sức chứa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tủ khóa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Không tìm thấy phòng học nào
                  </td>
                </tr>
              ) : (
                paginatedRooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.roomCode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.roomName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      Tòa {room.building} - Tầng {room.floor}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.roomType}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.capacity} người
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.lockerNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(room.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsEditModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(room._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-4">
            <ReactPaginate
              previousLabel="← Trước"
              nextLabel="Sau →"
              breakLabel="..."
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={({ selected }) => setCurrentPage(selected)}
              containerClassName="flex space-x-2"
              pageClassName="px-3 py-1 border rounded hover:bg-gray-100"
              activeClassName="bg-blue-500 text-white hover:bg-blue-600"
              previousClassName="px-3 py-1 border rounded hover:bg-gray-100"
              nextClassName="px-3 py-1 border rounded hover:bg-gray-100"
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        )}
      </Card>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          campuses={campuses}
        />
      )}

      {isEditModalOpen && selectedRoom && (
        <EditRoomModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRoom(null);
          }}
          onSubmit={(data) => handleEdit(selectedRoom._id, data)}
          room={selectedRoom}
          campuses={campuses}
        />
      )}

      {isViewModalOpen && selectedRoom && (
        <ViewRoomModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default RoomManagementPage;
