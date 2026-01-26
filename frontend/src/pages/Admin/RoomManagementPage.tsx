import React, { useEffect, useMemo, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { AxiosError } from 'axios';
import { Eye, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import roomService from '../../services/room.service';
import { campusService } from '../../services/campus.service';
import { Room, CreateRoomDto, UpdateRoomDto } from '../../types/room.types';
import CreateRoomModal from '../../components/modals/CreateRoomModal';
import EditRoomModal from '../../components/modals/EditRoomModal';
import ViewRoomModal from '../../components/modals/ViewRoomModal';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';

type Campus = {
  _id: string;
  campusName: string;
};

const ITEMS_PER_PAGE = 10;

const ROOM_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'available', label: 'Khả dụng' },
  { value: 'occupied', label: 'Đang sử dụng' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'reserved', label: 'Đã đặt' },
];

const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
  available: { label: 'Khả dụng', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  occupied: { label: 'Đang sử dụng', className: 'bg-blue-50 text-blue-600 border-blue-100' },
  maintenance: { label: 'Bảo trì', className: 'bg-amber-50 text-amber-600 border-amber-100' },
  reserved: { label: 'Đã đặt', className: 'bg-purple-50 text-purple-600 border-purple-100' },
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roomPendingDelete, setRoomPendingDelete] = useState<Room | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [campusFilter, setCampusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

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
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu phòng học',
        variant: 'destructive',
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
  const buildings = useMemo(() => (
    Array.from(
      new Set(
        rooms
          .map((room) => room.building)
          .filter((building): building is string => Boolean(building))
      )
    ).sort((a, b) => a.localeCompare(b))
  ), [rooms]);

  const filteredRooms = rooms.filter((room) => {
    const matchesCampus =
      campusFilter === 'all' ||
      (typeof room.campusId === 'object'
        ? room.campusId._id === campusFilter
        : room.campusId === campusFilter);
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || room.building === buildingFilter;
    const searchValue = search.trim().toLowerCase();
    const matchesSearch =
      !searchValue ||
      room.roomCode.toLowerCase().includes(searchValue) ||
      room.roomName.toLowerCase().includes(searchValue);
    return matchesCampus && matchesStatus && matchesBuilding && matchesSearch;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (a.building !== b.building) return a.building.localeCompare(b.building);
    if (a.floor !== b.floor) return a.floor - b.floor;
    return a.roomCode.localeCompare(b.roomCode);
  });

  const paginatedRooms = sortedRooms.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const pageCount = Math.ceil(sortedRooms.length / ITEMS_PER_PAGE);

  const statusCounts = rooms.reduce(
    (acc, room) => {
      if (room.status && acc[room.status as keyof typeof acc] !== undefined) {
        acc[room.status as keyof typeof acc] += 1;
      }
      return acc;
    },
    { available: 0, occupied: 0, maintenance: 0, reserved: 0 }
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [campusFilter, statusFilter, buildingFilter, search]);

  const getCampusName = (room: Room) => {
    if (room.campusId && typeof room.campusId === 'object') {
      return room.campusId.campusName ?? '-';
    }
    const campus = campuses.find((c) => c._id === room.campusId);
    return campus?.campusName || '-';
  };

  // =========================
  // CRUD handlers
  // =========================
  const handleCreate = async (data: CreateRoomDto) => {
    try {
      await roomService.createRoom(data);
      toast({
        title: 'Thành công',
        description: 'Tạo phòng học thành công!',
      });
      await fetchData();
      setIsCreateModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      toast({
        title: 'Lỗi',
        description: axiosError.response?.data?.message || 'Lỗi khi tạo phòng học',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (id: string, data: UpdateRoomDto) => {
    try {
      await roomService.updateRoom(id, data);
      toast({
        title: 'Thành công',
        description: 'Cập nhật phòng học thành công!',
      });
      await fetchData();
      setIsEditModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      toast({
        title: 'Lỗi',
        description: axiosError.response?.data?.message || 'Lỗi khi cập nhật phòng học',
        variant: 'destructive',
      });
    }
  };

  const requestDeleteRoom = (room: Room) => {
    setRoomPendingDelete(room);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomPendingDelete || deleteLoading) return;
    try {
      setDeleteLoading(true);
      await roomService.deleteRoom(roomPendingDelete._id);
      toast({
        title: 'Thành công',
        description: 'Xóa phòng học thành công!',
      });
      await fetchData();
      setConfirmOpen(false);
      setRoomPendingDelete(null);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      toast({
        title: 'Lỗi',
        description: axiosError.response?.data?.message || 'Lỗi khi xóa phòng học',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleteLoading) return;
    setConfirmOpen(false);
    setRoomPendingDelete(null);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await roomService.updateRoomStatus(id, status);
      toast({
        title: 'Thành công',
        description: 'Cập nhật trạng thái thành công!',
      });
      await fetchData();
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Lỗi khi cập nhật trạng thái',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_BADGE_MAP[status] || STATUS_BADGE_MAP.available;
    return (
      <Badge
        variant="outline"
        className={`border ${config.className} px-2 py-1 text-xs font-medium`}
      >
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng số phòng', value: rooms.length, color: 'text-foreground' },
    { label: 'Khả dụng', value: statusCounts.available, color: 'text-emerald-600' },
    { label: 'Đang sử dụng', value: statusCounts.occupied, color: 'text-blue-600' },
    { label: 'Bảo trì', value: statusCounts.maintenance, color: 'text-amber-600' },
    { label: 'Đã đặt', value: statusCounts.reserved, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Phòng học</h1>
          <p className="text-muted-foreground mt-2">
            Theo dõi, tạo mới và quản lý phòng học trong hệ thống
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm phòng học
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Lọc phòng theo nhu cầu tìm kiếm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="room-search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="room-search"
                  placeholder="Mã hoặc tên phòng..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {campuses.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.campusName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tòa nhà</Label>
              <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building} value={building}>
                      Tòa {building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng học ({sortedRooms.length})</CardTitle>
          <CardDescription>Theo dõi, cập nhật và quản lý chi tiết từng phòng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phòng</TableHead>
                  <TableHead>Tên phòng</TableHead>
                  <TableHead>Tòa/Tầng</TableHead>
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Tủ khóa</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <p className="text-muted-foreground">Không tìm thấy phòng học nào</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRooms.map((room) => (
                    <TableRow key={room._id}>
                      <TableCell className="font-medium">{room.roomCode}</TableCell>
                      <TableCell>{room.roomName}</TableCell>
                      <TableCell>
                        {room.building ? `Tòa ${room.building}` : '—'}
                        {typeof room.floor === 'number' && ` · Tầng ${room.floor}`}
                      </TableCell>
                      <TableCell>{room.roomType || '—'}</TableCell>
                      <TableCell>{room.capacity ? `${room.capacity} người` : '—'}</TableCell>
                      <TableCell>{room.lockerNumber || '—'}</TableCell>
                      <TableCell>{getCampusName(room)}</TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsViewModalOpen(true);
                            }}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsEditModalOpen(true);
                            }}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => requestDeleteRoom(room)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex justify-center">
              <ReactPaginate
                previousLabel="← Trước"
                nextLabel="Sau →"
                breakLabel="..."
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={({ selected }) => setCurrentPage(selected)}
                containerClassName="flex items-center gap-2"
                pageClassName="px-3 py-1 rounded-md border text-sm font-medium text-muted-foreground hover:bg-muted"
                activeClassName="border-primary bg-primary text-primary-foreground"
                previousClassName="px-3 py-1 rounded-md border text-sm font-medium hover:bg-muted"
                nextClassName="px-3 py-1 rounded-md border text-sm font-medium hover:bg-muted"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </CardContent>
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

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa phòng học"
        description={
          roomPendingDelete
            ? `Bạn có chắc chắn muốn xóa phòng ${roomPendingDelete.roomCode} - ${roomPendingDelete.roomName}?`
            : 'Xác nhận xóa phòng học.'
        }
        confirmText={deleteLoading ? 'Đang xóa...' : 'Xóa phòng'}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default RoomManagementPage;
