import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import CommonUserLayout from '../layouts/CommonUserLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import DashboardPage from '../pages/Admin/DashboardPage';
import UserManagementPage from '../pages/Admin/UserManagementPage';
import CommonUserPage from '../pages/MainPages/CommonUserPage';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          {/* Admin Routes - Only for admin and training_staff */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <UserManagementPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/rooms"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý Phòng học</h2>
                    <p className="mt-2 text-gray-600">Trang này đang được phát triển</p>
                  </div>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/schedules"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Lịch học</h2>
                    <p className="mt-2 text-gray-600">Trang này đang được phát triển</p>
                  </div>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Đặt phòng</h2>
                    <p className="mt-2 text-gray-600">Trang này đang được phát triển</p>
                  </div>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Cài đặt</h2>
                    <p className="mt-2 text-gray-600">Trang này đang được phát triển</p>
                  </div>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Common User Routes - For lecturer, student */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'education_officer']}>
                <CommonUserLayout>
                  <CommonUserPage />
                </CommonUserLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-schedules"
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'education_officer']}>
                <CommonUserLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Lịch học</h2>
                    <p className="mt-2 text-gray-600">Trang này đang được phát triển</p>
                  </div>
                </CommonUserLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'education_officer']}>
                <CommonUserLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Thông báo đơn duyệt</h2>
                    <p className="mt-2 text-gray-600">Trang này đang được phát triển</p>
                  </div>
                </CommonUserLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'education_officer']}>
                <CommonUserLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Lịch sử</h2>
                    <p className="mt-2 text-gray-600">Trang này đang được phát triển</p>
                  </div>
                </CommonUserLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;

