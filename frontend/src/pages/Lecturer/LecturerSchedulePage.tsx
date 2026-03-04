import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { scheduleService } from '@/services/schedule.service';
import { Schedule } from '@/types/schedule.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loading from '@/components/common/Loading';

const SLOT_LIST = [
  { number: 1, start: '07:00', end: '09:15', slotType: 'NEWSLOT' },
  { number: 2, start: '09:30', end: '11:45', slotType: 'NEWSLOT' },
  { number: 3, start: '13:00', end: '15:15', slotType: 'NEWSLOT' },
  { number: 4, start: '15:30', end: '17:45', slotType: 'NEWSLOT' },
  { number: 5, start: '18:00', end: '20:15', slotType: 'NEWSLOT' },
];
const WEEKDAYS = [
  { key: 1, label: 'Mon' },
  { key: 2, label: 'Tue' },
  { key: 3, label: 'Wed' },
  { key: 4, label: 'Thu' },
  { key: 5, label: 'Fri' },
  { key: 6, label: 'Sat' },
  { key: 0, label: 'Sun' },
];

function getWeekDates(date: Date) {
  // Return array of dates for the week (Monday to Sunday)
  const week: Date[] = [];
  const d = new Date(date);
  const day = d.getDay();
  // Calculate Monday (day: 0=Sunday, 1=Monday, ...)
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day === 0 ? 6 : day - 1)));
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    week.push(dt);
  }
  return week;
}

const LecturerSchedulePage: React.FC = () => {
      const navigate = useNavigate();
    // Helper: get all weeks in year
    function getWeeksOfYear(year: number) {
      const weeks: { label: string, start: Date, end: Date }[] = [];
      let d = new Date(year, 0, 1);
      // Find first Monday
      while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
      while (d.getFullYear() === year) {
        const start = new Date(d);
        const end = new Date(d);
        end.setDate(start.getDate() + 6);
        weeks.push({
          label: `${start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`,
          start,
          end
        });
        d.setDate(d.getDate() + 7);
      }
      return weeks;
    }

    // Dropdown state
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    const initialWeeks = getWeeksOfYear(currentYear);
    // Find the current week index
    const currentWeekIdx = initialWeeks.findIndex(w => currentDate >= w.start && currentDate <= w.end);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [weeksOfYear, setWeeksOfYear] = useState(initialWeeks);
    const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(currentWeekIdx === -1 ? 0 : currentWeekIdx);

    useEffect(() => {
      const weeks = getWeeksOfYear(selectedYear);
      setWeeksOfYear(weeks);
      // Find the week containing today's date
      const today = new Date();
      const idx = weeks.findIndex(w => today >= w.start && today <= w.end);
      setSelectedWeekIdx(idx === -1 ? 0 : idx);
      setSelectedDate((idx === -1 ? weeks[0].start : weeks[idx].start));
    }, [selectedYear]);

    useEffect(() => {
      setSelectedDate(weeksOfYear[selectedWeekIdx]?.start || selectedDate);
    }, [selectedWeekIdx, weeksOfYear]);
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [detailSchedule, setDetailSchedule] = useState<Schedule | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    const weekDates = getWeekDates(selectedDate);
    const startDate = weekDates[0].toISOString().slice(0, 10);
    const endDate = weekDates[6].toISOString().slice(0, 10);
    scheduleService.getAll({ lecturerId: user._id, startDate, endDate })
      .then(data => setSchedules(data))
      .catch(() => setError('Cannot load teaching schedule'))
      .finally(() => setLoading(false));
  }, [user, selectedDate]);

  const weekDates = getWeekDates(selectedDate);

  const getCell = (slot: any, weekdayIdx: number) => {
    const dateStr = weekDates[weekdayIdx].toLocaleDateString('en-CA'); // yyyy-mm-dd
    return schedules.find(sch => {
      let schDateStr = '';
      if (typeof sch.dateStart === 'string') {
        const d = new Date(sch.dateStart);
        schDateStr = d.toLocaleDateString('en-CA');
      } else if (sch.dateStart instanceof Date) {
        schDateStr = sch.dateStart.toLocaleDateString('en-CA');
      }
      return sch.slotNumber === slot.number && schDateStr === dateStr;
    });
  };

  const getWeekdayLabel = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return weekdays[d.getDay()];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-400 rounded bg-white hover:bg-gray-100 font-semibold"
        >
          <span className="mr-2">←</span> Back to SelfDemo
        </button>
      </div>
      <Card className="p-6 border border-gray-300 rounded-lg">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Tuần:</span>
            <select
              className="border border-gray-400 rounded px-2 py-1 bg-white"
              value={selectedWeekIdx}
              onChange={e => setSelectedWeekIdx(Number(e.target.value))}
            >
              {weeksOfYear.map((w, idx) => (
                <option key={idx} value={idx}>{w.label}</option>
              ))}
            </select>
            <span className="font-semibold">Năm:</span>
            <select
              className="border border-gray-400 rounded px-2 py-1 bg-white"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const year = 2023 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>

        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            {(!schedules || schedules.length === 0) ? (
              <div className="text-center text-gray-500 py-4 font-semibold">No teaching schedule for this week.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 border-collapse text-sm shadow-md rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-center border border-gray-300">Slot</th>
                      {weekDates.map((date, idx) => {
                        const weekday = date.getDay() === 0 ? 6 : date.getDay() - 1;
                        return (
                          <th key={idx} className="py-2 px-4 text-center border border-gray-300">
                            {WEEKDAYS[weekday].label}<br />
                            <span className="text-xs text-muted-foreground">{date.toLocaleDateString('en-GB')}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOT_LIST.map(slot => (
                      <tr key={slot.number} className="border-b border-gray-300">
                        <td className="py-2 px-4 font-semibold whitespace-nowrap text-center align-middle border border-gray-300">
                          <div>Slot {slot.number}</div>
                          <div className="text-xs text-muted-foreground" style={{ fontSize: '12px' }}>
                            ({slot.start} - {slot.end})
                          </div>
                        </td>
                        {weekDates.map((date, idx) => {
                          const cell = getCell(slot, idx);
                          return (
                            <td key={idx} className="py-2 px-4 align-top text-center min-w-[160px] border border-gray-300">
                              {cell ? (
                                <button
                                  className="w-full h-full flex items-center justify-center"
                                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                  onClick={() => {
                                    setDetailSchedule(cell);
                                    setShowDetailModal(true);
                                  }}
                                >
                                  <div className="space-y-1 text-center">
                                    <div className="font-semibold text-primary text-sm">{cell.classCode || '-'}</div>
                                    <div className="text-xs text-muted-foreground">{cell.subjectName || '-'}</div>
                                    <div className="text-xs text-muted-foreground">{typeof cell.roomId === 'object' ? cell.roomId.roomName || cell.roomId.roomCode : cell.roomId}</div>
                                    <div className="text-xs text-muted-foreground">{cell.startTime} - {cell.endTime}</div>
                                  </div>
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>
      {showDetailModal && detailSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[380px] max-w-[95vw] relative border border-blue-200">
            <button
              className="absolute top-3 right-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow"
              onClick={() => setShowDetailModal(false)}
              aria-label="Đóng"
            >×</button>
            <div className="flex flex-col items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-700">Chi tiết Lịch học</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px]">
              <div className="flex flex-col gap-2 border-r border-gray-200 pr-4">
                <div className="font-semibold text-blue-700 mb-1">Mã lớp: <span className="font-normal text-gray-900">{detailSchedule.classCode || '-'}</span></div>
                <div className="font-semibold text-blue-700 mb-1">Mã môn học: <span className="font-normal text-gray-900">{detailSchedule.subjectCode || '-'}</span></div>
                <div className="font-semibold text-blue-700 mb-1">Tên môn học: <span className="font-normal text-gray-900">{detailSchedule.subjectName || '-'}</span></div>
                <div className="font-semibold text-blue-700 mt-2 mb-1">Thông tin Phòng học</div>
                <div className="ml-2">Mã phòng: <span className="text-gray-900">{typeof detailSchedule.roomId === 'object' ? detailSchedule.roomId.roomCode : detailSchedule.roomId || '-'}</span></div>
                <div className="ml-2">Tên phòng: <span className="text-gray-900">{typeof detailSchedule.roomId === 'object' ? detailSchedule.roomId.roomName : '-'}</span></div>
                <div className="ml-2">Tòa nhà: <span className="text-gray-900">{typeof detailSchedule.roomId === 'object' ? detailSchedule.roomId.building || '-' : '-'}</span></div>
              </div>
              <div className="flex flex-col gap-2 pl-4">
                <div className="font-semibold text-blue-700 mt-2 mb-1">Thông tin Lịch học</div>
                <div className="ml-2">Ngày bắt đầu: <span className="text-gray-900">{detailSchedule.dateStart ? new Date(detailSchedule.dateStart).toLocaleDateString('vi-VN') : '-'}</span></div>
                <div className="ml-2">Thứ trong tuần: <span className="text-gray-900">{getWeekdayLabel(detailSchedule.dateStart)}</span></div>
                <div className="ml-2">Số tiết: <span className="text-gray-900">{detailSchedule.slotNumber || '-'}</span></div>
                <div className="ml-2">Giờ bắt đầu: <span className="text-gray-900">{detailSchedule.startTime || '-'}</span></div>
                <div className="ml-2">Giờ kết thúc: <span className="text-gray-900">{detailSchedule.endTime || '-'}</span></div>
                <div className="ml-2">Học kỳ: <span className="text-gray-900">{detailSchedule.semester || '-'}</span></div>
                <div className="ml-2">Trạng thái: <span className="text-gray-900">{detailSchedule.status || '-'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerSchedulePage;
