import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ReactPaginate from 'react-paginate';
import { AxiosError } from 'axios';
import { toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { lockerService } from '../../services/locker.service';
import { campusService } from '../../services/campus.service';

import CreateLockerModal from '../../components/modals/CreateLockerModal';
import EditLockerModal from '../../components/modals/EditLockerModal';
import ViewLockerModal from '../../components/modals/ViewLockerModal';
import { LockerPayload, LockerEntity } from '../../types/locker.type';

type Campus = {
  _id: string;
  campusName: string;
};

const LockerManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [lockers, setLockers] = useState<LockerEntity[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<LockerEntity | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  const [campusFilter, setCampusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // =========================
  // Fetch lockers & campuses
  // =========================
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching lockers and campuses...');
      const [lockerRes, campusRes] = await Promise.all([
        lockerService.getAll(),
        campusService.getAll(),
      ]);

      console.log('Locker API Response:', lockerRes);
      console.log('Campus API Response:', campusRes);

      const campusMap = new Map(campusRes.map((campus) => [campus._id, campus.campusName]));

      const lockersWithId = Array.isArray(lockerRes)
        ? lockerRes.map((l: any) => ({
            ...l,
            id: l._id ?? l.id,
            campusName: campusMap.get(l.campusId) || '', // Map campusName using campusId
            solenoids: Array.isArray(l.solenoids) ? l.solenoids : [], // Normalize solenoids
          }))
        : [];
      setLockers(lockersWithId);

      setCampuses(Array.isArray(campusRes) ? campusRes : []);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Fetch error:', axiosError);
      alert('Không thể tải dữ liệu.');
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
  const filteredLockers = lockers.filter((locker) => {
    const matchesCampus = campusFilter === 'all' || locker.campusId === campusFilter;
    const matchesStatus = statusFilter === 'all' || locker.status === statusFilter;
    const matchesActive =
      activeStatusFilter === 'all'
        ? true
        : activeStatusFilter === 'active'
          ? locker.isActive
          : !locker.isActive;
    const matchesSearch =
      locker.lockerNumber.toString().includes(search) ||
      locker.position.toLowerCase().includes(search.toLowerCase());
    return matchesCampus && matchesStatus && matchesActive && matchesSearch;
  });

  const sortedLockers = [...filteredLockers].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const paginatedLockers = sortedLockers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    const totalPages = Math.ceil(filteredLockers.length / itemsPerPage);
    const lastPageIndex = Math.max(0, totalPages - 1);

    if (currentPage > lastPageIndex) {
      setCurrentPage(lastPageIndex);
    }
  }, [filteredLockers.length, currentPage]);

  // =========================
  // Handlers
  // =========================
  const handleCreate = async (data: LockerPayload) => {
    try {
      await lockerService.create(data);

      toast.success('Tạo tủ thành công!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        transition: Slide,
      });

      setIsCreateOpen(false);

      // Fetch the updated data to ensure consistency
      await fetchData();
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Tạo tủ thất bại.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        transition: Slide,
      });
    }
  };


  const handleEdit = async (data: LockerPayload) => {
    if (!selectedLocker || !selectedLocker.id) {
      toast.error('Vui lòng chọn tủ hợp lệ.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide,
      });
      return;
    }
    try {
      const updatedLocker = await lockerService.update(selectedLocker.id, data);
      if (!updatedLocker || !updatedLocker.id) {
        throw new Error('Invalid response from server');
      }
      setLockers((prevLockers) =>
        prevLockers.map((locker) =>
          locker.id === updatedLocker.id ? updatedLocker : locker
        )
      );
      setIsEditOpen(false);
      setSelectedLocker(null);
      toast.success('Cập nhật thành công!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide,
      });
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Cập nhật thất bại.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide,
      });
    }
  };

  const handleDelete = async (id: string, lockerNumber: number) => {
    if (!window.confirm(`Bạn có thật sự muốn xóa tủ số ${lockerNumber}?`)) return;

    try {
      await lockerService.remove(id);
      toast.success(`Xóa tủ số ${lockerNumber} thành công!`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide,
      });
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Xóa tủ số ${lockerNumber} thất bại.`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide,
      });
    }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const getStatusColor = (status: LockerEntity['status']) => {
    const capitalizedStatus = capitalize(status);
    switch (status) {
      case 'available':
        return `text-green-600 ${capitalizedStatus}`;
      case 'occupied':
        return `text-yellow-600 ${capitalizedStatus}`;
      case 'maintenance':
        return `text-red-600 ${capitalizedStatus}`;
      default:
        return capitalizedStatus;
    }
  };

  const getBatteryColor = (batteryLevel: number) => {
    if (batteryLevel > 75) return 'text-green-600';
    if (batteryLevel > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return <Loading />;

  // =========================
  // Render
  // =========================
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Quản lý Tủ Khóa</h1>
        <Button onClick={() => setIsCreateOpen(true)}>+ Thêm tủ</Button>
      </div>

      <div className="text-lg font-medium text-gray-700">
        Tổng số lượng tủ: {filteredLockers.length}
      </div>

      <Card>
        {/* SEARCH & FILTER */}
        <div className="flex justify-between items-center mb-4 space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm số tủ hoặc vị trí"
              className="w-full px-4 py-2 border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex space-x-4">
            <select
              className="px-4 py-2 border rounded-lg"
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
            >
              <option value="all">Tất cả cơ sở</option>
              {campuses.map((campus) => (
                <option key={campus._id} value={campus._id}>
                  {campus.campusName}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Có Sẵn</option>
              <option value="occupied">Đang Sử Dụng</option>
              <option value="maintenance">Bảo Trì</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái hoạt động</option>
              <option value="active">Hoạt Động</option>
              <option value="inactive">Không Hoạt Động</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-300 w-12">STT</th>
                <th className="px-4 py-2 border border-gray-300 w-24">Số Tủ</th>
                <th className="px-4 py-2 border border-gray-300 w-64 text-left">Vị trí</th>
                <th className="px-4 py-2 border border-gray-300 w-64 text-left">Cơ sở</th>
                <th className="px-4 py-2 border border-gray-300 w-32 text-center">Trạng thái</th>
                <th className="px-4 py-2 border border-gray-300 w-24 text-center">Pin</th>
                <th className="px-4 py-2 border border-gray-300 w-40 text-center">Trạng Thái Hoạt Động</th>
                <th className="px-4 py-2 border border-gray-300 w-40 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLockers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-gray-500 text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                paginatedLockers.map((locker, index) => (
                  <tr key={locker.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300 text-center font-bold">
                      {currentPage * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center text-blue-600">
                      {locker.lockerNumber}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-left">{locker.position}</td>
                    <td className="px-4 py-2 border border-gray-300 text-left">{locker.campusName}</td>
                    <td className={`px-4 py-2 border border-gray-300 text-center ${getStatusColor(locker.status)}`}>
                      {capitalize(locker.status)}
                    </td>
                    <td className={`px-4 py-2 border border-gray-300 text-center ${getBatteryColor(locker.batteryLevel)}`}>
                      {locker.batteryLevel}%
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      <span className={`px-2 py-1 rounded-lg text-white ${locker.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                        {locker.isActive ? 'Hoạt Động' : 'Không Hoạt Động'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedLocker(locker);
                            setIsViewOpen(true);
                          }}
                        >
                          Xem
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedLocker(locker);
                            setIsEditOpen(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(locker.id, locker.lockerNumber)}>
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="mt-4 flex justify-center">
          <ReactPaginate
            forcePage={currentPage}
            pageCount={Math.ceil(filteredLockers.length / itemsPerPage)}
            onPageChange={(e: { selected: number }) => setCurrentPage(e.selected)}
            previousLabel="Trước"
            nextLabel="Tiếp"
            containerClassName="flex space-x-2"
            activeClassName="bg-blue-500 text-white px-3 py-1 rounded"
            pageClassName="px-3 py-1 bg-gray-200 rounded"
          />
        </div>
      </Card>

      {/* MODALS */}
      <CreateLockerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        onUpdate={async (id, data) => {
          const updated = await lockerService.update(id, data);
          setLockers((prev) =>
            prev.map((l) => (l.id === updated.id ? updated : l))
          );
          toast.success('Cập nhật tủ thành công!', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
            transition: Slide,
          });
        }}
        campuses={campuses}
        setLockers={setLockers} // Pass setLockers to CreateLockerModal
      />
      <EditLockerModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onEdit={handleEdit}
        locker={selectedLocker ?? undefined}
        campuses={campuses}
      />
      <ViewLockerModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        onEdit={() => {
          setIsViewOpen(false);
          setIsEditOpen(true);
        }}
        locker={selectedLocker ?? undefined}
      />
    </div>
  );
};

export default LockerManagementPage;
