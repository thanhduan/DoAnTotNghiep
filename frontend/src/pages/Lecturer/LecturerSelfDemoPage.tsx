import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { scheduleService } from '@/services/schedule.service';
import { Schedule } from '@/types/schedule.types';

const LecturerSelfDemoPage: React.FC = () => {
    const navigate = useNavigate();
  const { user, roleDetails, permissions } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await scheduleService.getAll();
        setSchedules(data || []);
      } catch (err: any) {
        setError(err?.message || 'Cannot load demo schedule data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Lecturer Demo - Scope SELF</h1>
        <p className="mt-2 text-gray-600">
          Demo page for lecturer scope: only reads own data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Role Code</p>
          <p className="text-lg font-semibold text-gray-900">{roleDetails?.roleCode || '-'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Scope</p>
          <p className="text-lg font-semibold text-gray-900">{roleDetails?.scope || '-'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Permissions</p>
          <p className="text-lg font-semibold text-gray-900">{permissions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">User Information</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <p>Full Name: {user?.fullName || '-'}</p>
          <p>Email: {user?.email || '-'}</p>
          <p>Campus: {user?.campusId?.campusName || '-'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Schedule (scoped SELF in backend)</h2>
          <button
            onClick={() => navigate('/lecturer/schedules')}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View detailed weekly teaching schedule
          </button>
        </div>
        {isLoading && <p className="text-gray-600">Loading data...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-center text-gray-700">
                  <th className="py-2 px-4 border border-gray-300">Date</th>
                  <th className="py-2 px-4 border border-gray-300">Class Code</th>
                  <th className="py-2 px-4 border border-gray-300">Subject Name</th>
                  <th className="py-2 px-4 border border-gray-300">Room</th>
                  <th className="py-2 px-4 border border-gray-300">Slot</th>
                  <th className="py-2 px-4 border border-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {schedules.slice(0, 20).map((item, idx) => {
                  const room = typeof item.roomId === 'object' ? item.roomId.roomCode : String(item.roomId || '-');
                  const startTime = item.startTime || '-';
                  const endTime = item.endTime || '-';
                  return (
                    <tr key={item._id} className={
                      `border-b border-gray-200 text-gray-800 text-center ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`
                    }>
                      <td className="py-2 px-4 border border-gray-300">{String(item.dateStart).slice(0, 10)}</td>
                      <td className="py-2 px-4 border border-gray-300">{item.classCode || '-'}</td>
                      <td className="py-2 px-4 border border-gray-300">{item.subjectName || '-'}</td>
                      <td className="py-2 px-4 border border-gray-300">{room}</td>
                      <td className="py-2 px-4 border border-gray-300">{item.slotNumber}</td>
                      <td className="py-2 px-4 border border-gray-300">{startTime} - {endTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {schedules.length === 0 && (
              <p className="text-gray-500 mt-3">No matching schedule found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerSelfDemoPage;