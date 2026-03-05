import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, Trash2, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import bookingService from '@/services/booking.service';
import wsService from '@/services/websocket.service';
import { Booking, BookingStatus } from '@/types/booking.types';
import { useToast } from '@/hooks/use-toast';
import PermissionGuard from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/utils/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const STATUS_OPTIONS: Array<{ value: 'all' | BookingStatus; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

const formatBookingDate = (value: unknown): string => {
  if (!value) {
    return '--';
  }

  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return format(parsed, 'dd/MM/yyyy', { locale: vi });
};

const BookingManagementPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchLecturer, setSearchLecturer] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [socketConnected, setSocketConnected] = useState(false);
  const { toast } = useToast();

  const fetchBookings = useCallback(async (keyword?: string) => {
    try {
      setLoading(true);
      const data = await bookingService.getAll({
        lecturerSearch: keyword || undefined,
      });
      setBookings(data);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể tải danh sách booking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const socket = wsService.connect();
    setSocketConnected(socket.connected);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onBookingUpdated = () => {
      fetchBookings();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    wsService.on('booking:updated', onBookingUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      wsService.off('booking:updated', onBookingUpdated);
      wsService.disconnect();
    };
  }, [fetchBookings]);

  const lecturerOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();

    bookings.forEach((booking) => {
      if (typeof booking.lecturerId === 'object' && booking.lecturerId) {
        map.set(booking.lecturerId._id, {
          id: booking.lecturerId._id,
          label: `${booking.lecturerId.fullName} (${booking.lecturerId.email})`,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [bookings]);

  const [lecturerFilter, setLecturerFilter] = useState<string>('all');

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchStatus = statusFilter === 'all' ? true : booking.status === statusFilter;

      const matchLecturer =
        lecturerFilter === 'all'
          ? true
          : typeof booking.lecturerId === 'object' && booking.lecturerId?._id === lecturerFilter;

      const keyword = searchLecturer.trim().toLowerCase();
      const lecturerName =
        typeof booking.lecturerId === 'object' ? booking.lecturerId.fullName.toLowerCase() : '';
      const lecturerEmail =
        typeof booking.lecturerId === 'object' ? booking.lecturerId.email.toLowerCase() : '';

      const matchSearch =
        keyword.length === 0 ||
        lecturerName.includes(keyword) ||
        lecturerEmail.includes(keyword) ||
        booking.purpose.toLowerCase().includes(keyword);

      return matchStatus && matchLecturer && matchSearch;
    });
  }, [bookings, statusFilter, lecturerFilter, searchLecturer]);

  const handleSearch = async () => {
    await fetchBookings(searchLecturer.trim());
  };

  const handleStatusUpdate = async (bookingId: string, nextStatus: BookingStatus) => {
    try {
      setSavingId(bookingId);
      await bookingService.update(bookingId, { status: nextStatus });
      toast({ title: 'Thành công', description: 'Đã cập nhật trạng thái booking' });
      await fetchBookings(searchLecturer.trim());
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể cập nhật booking',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa booking này?')) {
      return;
    }

    try {
      setSavingId(bookingId);
      await bookingService.remove(bookingId);
      toast({ title: 'Thành công', description: 'Đã xóa booking' });
      await fetchBookings(searchLecturer.trim());
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể xóa booking',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Booking</h1>
          <p className="text-muted-foreground mt-2">
            Theo dõi toàn bộ booking theo campus, tìm kiếm theo giảng viên, và cập nhật realtime qua WebSocket.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          {socketConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span>Kết nối realtime</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-600" />
              <span>Mất kết nối realtime</span>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc booking</CardTitle>
          <CardDescription>Lọc và tìm kiếm theo giảng viên để xem nhanh lịch đặt phòng.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Tìm kiếm giảng viên</Label>
            <div className="flex items-center gap-2">
              <Input
                value={searchLecturer}
                onChange={(e) => setSearchLecturer(e.target.value)}
                placeholder="Tên hoặc email giảng viên"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lọc theo giảng viên</Label>
            <Select value={lecturerFilter} onValueChange={setLecturerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn giảng viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giảng viên</SelectItem>
                {lecturerOptions.map((lecturer) => (
                  <SelectItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | BookingStatus) => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Đồng bộ dữ liệu</Label>
            <Button className="w-full" variant="secondary" onClick={() => fetchBookings(searchLecturer.trim())}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới danh sách
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách booking ({filteredBookings.length})</CardTitle>
          <CardDescription>Hiển thị đầy đủ booking trong campus theo quyền `bookings.manage`.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Giảng viên</TableHead>
                  <TableHead>Mục đích</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Đang tải dữ liệu booking...
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Không có booking phù hợp với bộ lọc hiện tại.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const room = typeof booking.roomId === 'object' ? booking.roomId : null;
                    const lecturer = typeof booking.lecturerId === 'object' ? booking.lecturerId : null;

                    return (
                      <TableRow key={booking._id}>
                        <TableCell>
                          {formatBookingDate(booking.bookingDate)}
                        </TableCell>
                        <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                        <TableCell>
                          <div className="font-medium">{room?.roomCode || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{room?.roomName || ''}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{lecturer?.fullName || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{lecturer?.email || ''}</div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={booking.purpose}>
                          {booking.purpose}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_COLOR[booking.status]}>
                            {STATUS_LABEL[booking.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={booking.status}
                              onValueChange={(value: BookingStatus) => handleStatusUpdate(booking._id, value)}
                              disabled={savingId === booking._id}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Chờ duyệt</SelectItem>
                                <SelectItem value="approved">Đã duyệt</SelectItem>
                                <SelectItem value="rejected">Từ chối</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                              </SelectContent>
                            </Select>

                            <PermissionGuard permissions={[PERMISSIONS.BOOKINGS_DELETE]}>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDelete(booking._id)}
                                disabled={savingId === booking._id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagementPage;
