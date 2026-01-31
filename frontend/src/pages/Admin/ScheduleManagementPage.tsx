import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Upload, Search, CalendarIcon, X, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import PermissionGuard from '../../components/PermissionGuard';
import { PERMISSIONS } from '../../utils/permissions';
import roomService from '../../services/room.service';
import { timeSlotService } from '../../services/time-slot.service';
import { scheduleService, QueryScheduleParams } from '../../services/schedule.service';
import { Room } from '../../types/room.types';
import { TimeSlot } from '../../types/time-slot.types';
import { Schedule } from '../../types/schedule.types';
import { cn } from '../../lib/utils';
import ViewScheduleModal from '../../components/modals/ViewScheduleModal';
import EditScheduleModal from '../../components/modals/EditScheduleModal';

interface ScheduleCell {
  schedule: Schedule | null;
  roomId: string;
  slotNumber: number;
  slotType: 'OLDSLOT' | 'NEWSLOT';
}

const ScheduleManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  // Date navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Filters
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [roomSearch, setRoomSearch] = useState<string>('');
  const [slotTypeFilter, setSlotTypeFilter] = useState<'OLDSLOT' | 'NEWSLOT' | 'all'>('OLDSLOT');
  
  // Modals
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Import
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'dryRun' | 'strict' | 'lenient'>('strict');
  const [showImportModeDialog, setShowImportModeDialog] = useState(false);
  const [showImportResultDialog, setShowImportResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    inserted: number;
    total: number;
    failed?: number;
    errors?: Array<{
      rowIndex?: number;
      row?: number;
      field?: string;
      code?: string;
      error?: string;
      message?: string;
    }>;
  } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch schedules when date changes
  useEffect(() => {
    if (rooms.length > 0 && timeSlots.length > 0) {
      fetchSchedules();
    }
  }, [currentDate, rooms.length, timeSlots.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, slotsData] = await Promise.all([
        roomService.getAllRooms({ isActive: true }),
        timeSlotService.getAll({ isActive: true }),
      ]);

      setRooms(roomsData);
      setTimeSlots(slotsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu phòng học và tiết học');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);

      const params: QueryScheduleParams = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const schedulesData = await scheduleService.getAll(params);
      setSchedules(schedulesData);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast.error('Không thể tải lịch học');
    }
  };

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesBuilding = buildingFilter === 'all' || room.building === buildingFilter;
      const matchesSearch = 
        roomSearch === '' ||
        room.roomCode.toLowerCase().includes(roomSearch.toLowerCase()) ||
        room.roomName.toLowerCase().includes(roomSearch.toLowerCase());
      return matchesBuilding && matchesSearch;
    });
  }, [rooms, buildingFilter, roomSearch]);

  const filteredTimeSlots = useMemo(() => {
    return timeSlots.filter((slot) => {
      return slotTypeFilter === 'all' || slot.slotType === slotTypeFilter;
    }).sort((a, b) => {
      if (a.slotType !== b.slotType) {
        return a.slotType === 'OLDSLOT' ? -1 : 1;
      }
      return a.slotNumber - b.slotNumber;
    });
  }, [timeSlots, slotTypeFilter]);

  const buildings = useMemo(() => {
    return Array.from(new Set(rooms.map((r) => r.building))).sort();
  }, [rooms]);

  const scheduleMap = useMemo(() => {
    const map = new Map<string, Schedule>();
    
    schedules.forEach((schedule) => {
      const roomId = typeof schedule.roomId === 'string' ? schedule.roomId : schedule.roomId._id;
      const scheduleDate = new Date(schedule.dateStart);
      const dateStr = scheduleDate.toISOString().split('T')[0];
      
      const key = `${roomId}_${dateStr}_${schedule.slotNumber}_${schedule.slotType}`;
      map.set(key, schedule);
    });
    
    return map;
  }, [schedules]);

  const scheduleGrid = useMemo(() => {
    const grid: ScheduleCell[][] = [];
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    filteredRooms.forEach((room) => {
      const row: ScheduleCell[] = [];
      const roomId = room._id;
      
      filteredTimeSlots.forEach((slot) => {
        const key = `${roomId}_${currentDateStr}_${slot.slotNumber}_${slot.slotType}`;
        const schedule = scheduleMap.get(key) || null;
        
        row.push({
          schedule,
          roomId,
          slotNumber: slot.slotNumber,
          slotType: slot.slotType,
        });
      });
      grid.push(row);
    });
    
    return grid;
  }, [filteredRooms, filteredTimeSlots, scheduleMap, currentDate]);

  const handlePrevDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setCurrentDate(newDate);
  };

  const handleCellClick = (cell: ScheduleCell) => {
    if (cell.schedule) {
      setSelectedSchedule(cell.schedule);
      setIsViewModalOpen(true);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      toast.error('Chỉ chấp nhận file CSV hoặc Excel (.csv, .xlsx, .xls)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setPendingFile(file);
    setShowImportModeDialog(true);
  };

  const safeString = (v: unknown): string | undefined => {
    if (typeof v === 'string') return v;
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  const normalizeErrors = (errors: any[]): Array<{
    rowIndex?: number;
    row?: number;
    field?: string;
    code?: string;
    error?: string;
    message?: string;
  }> => {
    if (!Array.isArray(errors)) return [];
    
    return errors.map((err) => {
      if (err && typeof err === 'object' && !Array.isArray(err)) {
        const rowIndex = typeof err.rowIndex === 'number' ? err.rowIndex : undefined;
        const row = typeof err.row === 'number' ? err.row : undefined;
        const field = typeof err.field === 'string' ? err.field : undefined;
        const code = typeof err.code === 'string' ? err.code : undefined;
        
        const error = safeString(err.error);
        const message = safeString(err.message);
        
        return {
          rowIndex,
          row,
          field,
          code,
          error,
          message,
        };
      }
      if (typeof err === 'string') {
        return { message: err };
      }
      return { message: 'Lỗi không xác định' };
    });
  };

  const executeImport = async () => {
    if (!pendingFile) return;

    try {
      setIsImporting(true);
      setShowImportModeDialog(false);
      
      const result = await scheduleService.import(pendingFile, importMode);
      
      let inserted = 0;
      let failed = 0;
      
      if (importMode === 'dryRun') {
        inserted = result.data.summary?.valid || 0;
        failed = result.data.summary?.invalid || 0;
      } else {
        inserted = result.data.inserted || result.data.summary?.inserted || 0;
        
        const failedValue = result.data.failed !== undefined ? result.data.failed : result.data.summary?.failed;
        if (Array.isArray(failedValue)) {
          failed = failedValue.length;
        } else if (typeof failedValue === 'number') {
          failed = failedValue;
        } else {
          failed = 0;
        }
      }
      
      const normalizedErrors = normalizeErrors(result.data.errors || []);
      
      console.log('Import result data:', result.data);
      console.log('Raw errors:', result.data.errors);
      console.log('Normalized errors:', normalizedErrors);
      
      setImportResult({
        success: result.success,
        inserted,
        total: result.data.total || result.data.summary?.total || 0,
        failed,
        errors: normalizedErrors,
      });
      setShowImportResultDialog(true);
      
      if (importMode !== 'dryRun') {
        await fetchSchedules();
      }
    } catch (error: any) {
      console.error('Import error:', error);
      
      const errorData = error;
      
      const errorErrors = errorData?.errors ? normalizeErrors(errorData.errors) : 
                         [{ row: 0, message: typeof error?.message === 'string' ? error.message : 'Import thất bại' }];
      
      const total = errorData?.total ?? errorData?.summary?.total ?? (errorErrors.length > 0 ? errorErrors.length : 0);
      const inserted = errorData?.inserted ?? errorData?.summary?.inserted ?? 0;
      
      let failedCount = 0;
      if (errorData?.failed !== undefined) {
        if (Array.isArray(errorData.failed)) {
          failedCount = errorData.failed.length;
        } else if (typeof errorData.failed === 'number') {
          failedCount = errorData.failed;
        }
      } else if (errorData?.summary?.failed !== undefined) {
        failedCount = errorData.summary.failed;
      } else {
        failedCount = errorErrors.length;
      }
      
      setImportResult({
        success: false,
        inserted,
        total,
        failed: failedCount,
        errors: errorErrors,
      });
      setShowImportResultDialog(true);
    } finally {
      setIsImporting(false);
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get schedule display info
  const getScheduleInfo = (schedule: Schedule) => {
    const room = typeof schedule.roomId === 'object' ? schedule.roomId : null;
    const lecturer = typeof schedule.lecturerId === 'object' ? schedule.lecturerId : null;
    
    return {
      classCode: schedule.classCode || 'N/A',
      subjectName: schedule.subjectName || 'N/A',
      lecturerName: lecturer?.fullName || 'N/A',
      timeRange: `${schedule.startTime} - ${schedule.endTime}`,
      roomCode: room?.roomCode || 'N/A',
    };
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Quản lý Lịch học</h1>
        <div className="flex gap-2">
          <PermissionGuard permissions={[PERMISSIONS.SCHEDULES_CREATE]}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Đang import...' : 'Import Excel/CSV'}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevDay}
              aria-label="Ngày trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col items-center min-w-[240px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(currentDate, "PPP", { locale: vi })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => date && setCurrentDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <span className="text-sm text-muted-foreground mt-1">
                {format(currentDate, "EEEE", { locale: vi })}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextDay}
              aria-label="Ngày sau"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hôm nay
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm phòng học..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tòa nhà" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building} value={building}>
                    Tòa {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={slotTypeFilter} onValueChange={(value) => setSlotTypeFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Loại tiết" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại tiết</SelectItem>
                <SelectItem value="OLDSLOT">Tiết cũ (1.5h)</SelectItem>
                <SelectItem value="NEWSLOT">Tiết mới (2.25h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {buildingFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Tòa {buildingFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setBuildingFilter('all')}
                />
              </Badge>
            )}
            
            {slotTypeFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {slotTypeFilter === 'OLDSLOT' ? 'Tiết cũ' : 'Tiết mới'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSlotTypeFilter('all')}
                />
              </Badge>
            )}
            
            {roomSearch && (
              <Badge variant="secondary" className="gap-1">
                Tìm: "{roomSearch}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setRoomSearch('')}
                />
              </Badge>
            )}
            
            {(buildingFilter !== 'all' || slotTypeFilter !== 'all' || roomSearch) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setBuildingFilter('all');
                  setSlotTypeFilter('all');
                  setRoomSearch('');
                }}
              >
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Schedule Grid Table - Desktop */}
      <Card>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={cn(
                    "sticky left-0 z-10",
                    "bg-background border border-border",
                    "px-4 py-3",
                    "text-left text-sm font-semibold text-foreground",
                    "min-w-[120px]"
                  )}>
                    Phòng học
                  </th>
                  {filteredTimeSlots.map((slot) => (
                    <th
                      key={`${slot.slotType}-${slot.slotNumber}`}
                      className={cn(
                        "border border-border",
                        "px-3 py-3",
                        "text-center text-sm font-semibold",
                        "bg-muted/50",
                        "min-w-[150px]"
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        <span>{slot.slotName || `Tiết ${slot.slotNumber}`}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleGrid.length === 0 ? (
                  <tr>
                    <td
                      colSpan={filteredTimeSlots.length + 1}
                      className="px-4 py-12 text-center border"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-muted p-3">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Không tìm thấy phòng học</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setBuildingFilter('all');
                            setRoomSearch('');
                            setSlotTypeFilter('all');
                          }}
                        >
                          Xóa bộ lọc
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  scheduleGrid.map((row, rowIndex) => {
                    const room = filteredRooms[rowIndex];
                    return (
                      <tr key={room._id}>
                        <td className={cn(
                          "sticky left-0 z-10",
                          "bg-background border border-border",
                          "px-4 py-2 font-medium"
                        )}>
                          <div className="font-semibold">{room.roomCode}</div>
                          <div className="text-xs text-muted-foreground">{room.roomName}</div>
                        </td>
                        {row.map((cell, cellIndex) => {
                          const slot = filteredTimeSlots[cellIndex];
                          const hasSchedule = cell.schedule !== null;
                          const scheduleInfo = hasSchedule ? getScheduleInfo(cell.schedule!) : null;

                          return (
                            <td
                              key={`${slot.slotType}-${slot.slotNumber}`}
                              className={cn(
                                "border px-2 py-3 min-h-[100px] cursor-pointer transition-colors",
                                hasSchedule ? [
                                  "bg-primary/5 border-l-4 border-l-primary",
                                  "hover:bg-primary/10"
                                ] : "hover:bg-accent/50"
                              )}
                              onClick={() => handleCellClick(cell)}
                            >
                              {hasSchedule && scheduleInfo ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="space-y-1.5">
                                        <div className="font-semibold text-sm text-foreground truncate">
                                          {scheduleInfo.classCode}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                          {scheduleInfo.subjectName}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                          {scheduleInfo.lecturerName}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground/70">
                                          {scheduleInfo.timeRange}
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <div className="space-y-1">
                                        <div className="font-semibold">{scheduleInfo.classCode}</div>
                                        <div className="text-sm">{scheduleInfo.subjectName}</div>
                                        <div className="text-sm">{scheduleInfo.lecturerName}</div>
                                        <div className="text-sm text-muted-foreground">{scheduleInfo.timeRange}</div>
                                        <div className="text-xs text-muted-foreground mt-2">Click để xem chi tiết</div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <div className="flex items-center justify-center h-full py-4">
                                  <span className="text-xs text-muted-foreground/50">Trống</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Mobile Accordion View - Hidden on desktop */}
      <div className="block sm:hidden">
        <div className="space-y-4">
          {filteredRooms.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="rounded-full bg-muted p-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">Không tìm thấy phòng học</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Thử thay đổi bộ lọc
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setBuildingFilter('all');
                    setRoomSearch('');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </Card>
          ) : (
            filteredRooms.map((room, roomIndex) => {
              const row = scheduleGrid[roomIndex];
              return (
                <Card key={room._id}>
                  <div className="font-semibold mb-3">
                    {room.roomCode} - {room.roomName}
                  </div>
                  <div className="space-y-2">
                    {row.map((cell, cellIndex) => {
                      const slot = filteredTimeSlots[cellIndex];
                      const hasSchedule = cell.schedule !== null;
                      const scheduleInfo = hasSchedule ? getScheduleInfo(cell.schedule!) : null;

                      return (
                        <div
                          key={`${slot.slotType}-${slot.slotNumber}`}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-colors",
                            "hover:border-primary/50",
                            hasSchedule && "bg-primary/5 border-l-4 border-l-primary"
                          )}
                          onClick={() => handleCellClick(cell)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {slot.slotName || `Tiết ${slot.slotNumber}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          {hasSchedule && scheduleInfo ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-sm">{scheduleInfo.classCode}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {scheduleInfo.subjectName}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {scheduleInfo.lecturerName}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">Trống</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <ViewScheduleModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSchedule(null);
        }}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
        schedule={selectedSchedule}
      />
      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSchedule(null);
        }}
        onUpdate={async () => {
          await fetchSchedules();
          setIsEditModalOpen(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
      />

      {/* Import Mode Selection Dialog */}
      <Dialog open={showImportModeDialog} onOpenChange={setShowImportModeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn chế độ Import</DialogTitle>
            <DialogDescription>
              Chọn cách thức xử lý khi import file lịch học
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup value={importMode} onValueChange={(value: any) => setImportMode(value)}>
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="dryRun" id="dryRun" />
                <Label htmlFor="dryRun" className="font-normal cursor-pointer flex-1">
                  <div className="font-semibold">Dry Run (Chạy thử)</div>
                  <p className="text-sm text-muted-foreground">
                    Kiểm tra file và hiển thị lỗi mà không lưu vào database
                  </p>
                </Label>
              </div>
              
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="strict" id="strict" />
                <Label htmlFor="strict" className="font-normal cursor-pointer flex-1">
                  <div className="font-semibold">Strict (Nghiêm ngặt)</div>
                  <p className="text-sm text-muted-foreground">
                    Dừng ngay khi gặp lỗi, không import dòng nào nếu có lỗi
                  </p>
                </Label>
              </div>
              
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="lenient" id="lenient" />
                <Label htmlFor="lenient" className="font-normal cursor-pointer flex-1">
                  <div className="font-semibold">Lenient (Linh hoạt)</div>
                  <p className="text-sm text-muted-foreground">
                    Bỏ qua các dòng lỗi, chỉ import các dòng hợp lệ
                  </p>
                </Label>
              </div>
            </RadioGroup>

            {pendingFile && (
              <Alert>
                <AlertDescription>
                  <strong>File:</strong> {pendingFile.name} ({(pendingFile.size / 1024).toFixed(2)} KB)
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportModeDialog(false);
                setPendingFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Hủy
            </Button>
            <Button onClick={executeImport} disabled={isImporting}>
              {isImporting ? 'Đang import...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Result Dialog */}
      <Dialog open={showImportResultDialog} onOpenChange={setShowImportResultDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {importResult?.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Kết quả Import
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{importResult?.total || 0}</div>
                <div className="text-sm text-muted-foreground">Tổng số</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult?.inserted || 0}</div>
                <div className="text-sm text-muted-foreground">Thành công</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResult?.failed || 0}</div>
                <div className="text-sm text-muted-foreground">Thất bại</div>
              </div>
            </div>

            {/* Mode info */}
            {importMode === 'dryRun' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Chế độ <strong>Dry Run</strong> - Không có dữ liệu nào được lưu vào database.
                </AlertDescription>
              </Alert>
            )}

            {/* Lenient mode info with errors */}
            {importMode === 'lenient' && importResult?.failed && importResult.failed > 0 && (
              <Alert variant="default" className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Chế độ <strong>Linh hoạt</strong> - Đã bỏ qua {importResult.failed} dòng lỗi và import {importResult.inserted} dòng hợp lệ.
                </AlertDescription>
              </Alert>
            )}

            {/* Error list */}
            {importResult?.errors && importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Chi tiết lỗi ({importResult.errors.length})
                </h4>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Dòng</th>
                        <th className="px-3 py-2 text-left font-medium">Lỗi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {importResult.errors.map((error, idx) => {
                        const rowNumber = error.row ?? error.rowIndex ?? 'N/A';
                        const errorMessage = error.message ?? error.error ?? 'Lỗi không xác định';
                        
                        return (
                          <tr key={idx} className="hover:bg-muted/50">
                            <td className="px-3 py-2 font-mono text-muted-foreground">
                              {rowNumber}
                            </td>
                            <td className="px-3 py-2 text-red-600">
                              {errorMessage}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowImportResultDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManagementPage;
