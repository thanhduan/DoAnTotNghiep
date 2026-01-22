# Permission-Based Routing Migration

## 📝 Overview
Đã chuyển đổi từ **Role-Based Routing** sang **Permission-Based Routing** để:
- Campus Admin có thể truy cập AdminLayout/pages
- Hỗ trợ tạo role mới động từ Training Department
- Không cần hardcode role names trong routes
- Scalable cho Phase 3 (multi-campus)

---

## 🔄 Changes Made

### 1. **routes/index.tsx** - Xóa hardcode roles
**Trước:**
```tsx
<ProtectedRoute allowedRoles={[ROLE_NAMES.ADMIN, ROLE_NAMES.TRAINING_STAFF]}>
  <AdminLayout><DashboardPage /></AdminLayout>
</ProtectedRoute>
```

**Sau:**
```tsx
<ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_READ]}>
  <AdminLayout><UserManagementPage /></AdminLayout>
</ProtectedRoute>
```

**Kết quả:**
- Xóa tất cả `allowedRoles` props
- Chỉ dùng `requiredPermissions` để check quyền
- Campus Admin tự động truy cập được nếu có permission

---

### 2. **components/ProtectedRoute.tsx** - Đổi priority logic
**Trước:**
```tsx
// Check role first → then permission
if (allowedRoles && !isAllowed) {
  redirect to default dashboard
}
if (requiredPermissions && !hasPermission) {
  show access denied
}
```

**Sau:**
```tsx
// Check permission first → then role (legacy)
if (requiredPermissions && !hasPermission) {
  show access denied
  return // Stop here
}
// Only check role if no permission check specified
if (allowedRoles && !isAllowed) {
  redirect to default dashboard
}
```

**Kết quả:**
- Permission có priority cao hơn role
- Nếu có permission → bypass role check
- Chỉ fallback sang role check khi không có permission requirement

---

### 3. **constants/roles.ts** - Update role constants
**Trước:**
```typescript
export const ROLE_NAMES = {
  ADMIN: 'Admin',
  TRAINING_STAFF: 'Training Staff',
  LECTURER: 'Lecturer',
  STUDENT: 'Student',
};

export const ROLE_SLUGS = {
  ADMIN: 'admin',
  TRAINING_STAFF: 'training_staff',
  // ...
};
```

**Sau:**
```typescript
export const ROLE_NAMES = {
  SUPER_ADMIN: 'Super Admin',
  CAMPUS_ADMIN: 'Campus Admin',
  TRAINING_OFFICER: 'Training Officer',
  LECTURER: 'Lecturer',
  SECURITY: 'Security',
  STUDENT: 'Student',
};

export const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CAMPUS_ADMIN: 'CAMPUS_ADMIN',
  TRAINING_OFFICER: 'TRAINING_OFFICER',
  // ...
};
```

**Kết quả:**
- Align với backend Role schema (roleCode, roleName)
- Thêm CAMPUS_ADMIN, TRAINING_OFFICER, SECURITY
- Xóa ROLE_SLUGS (không còn dùng)
- Đổi sang ROLE_CODES (match backend)

---

## 🎯 Permission-Based Access Control

### Admin Routes (Anyone with permission can access)
```tsx
// Dashboard - No permission required (basic admin access)
<ProtectedRoute>
  <AdminLayout><DashboardPage /></AdminLayout>
</ProtectedRoute>

// Users Management
<ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_READ]}>
  <AdminLayout><UserManagementPage /></AdminLayout>
</ProtectedRoute>

// Roles Management
<ProtectedRoute requiredPermissions={[PERMISSIONS.ROLES_READ]}>
  <AdminLayout><RoleManagementPage /></AdminLayout>
</ProtectedRoute>

// Rooms, Schedules, Bookings, Settings
// All use requiredPermissions instead of allowedRoles
```

### User Routes (No permission checks - basic access)
```tsx
<ProtectedRoute>
  <CommonUserLayout><CommonUserPage /></CommonUserLayout>
</ProtectedRoute>
```

---

## 🔐 Who Can Access What?

### Super Admin (roleLevel: 0)
- ✅ All admin pages (has all permissions)
- ✅ Cross-campus access
- ✅ Can create/manage roles
- ✅ Can manage all users, rooms, schedules

### Campus Admin (roleLevel: 1)
- ✅ All admin pages **IN THEIR CAMPUS**
- ✅ Dashboard, Users, Rooms, Schedules, Bookings
- ⚠️ Roles management (if granted permission)
- ❌ Cross-campus access (filtered by CampusScopeGuard)

### Training Officer (roleLevel: 2)
- ✅ Manage schedules, rooms, bookings **IN THEIR CAMPUS**
- ✅ Create/update users
- ❌ Delete users (need higher permission)
- ❌ Manage roles
- ❌ Settings

### Lecturer (roleLevel: 3)
- ✅ View their schedules
- ✅ Book rooms for teaching
- ✅ View their bookings history
- ❌ No admin pages access

### Student (roleLevel: 4)
- ✅ View their class schedules
- ✅ View their bookings
- ❌ No admin pages access
- ❌ No booking creation (read-only)

---

## 🚀 Benefits

### 1. **Scalability**
- Training Department có thể tạo role mới (e.g., "Assistant Lecturer")
- Gán permissions phù hợp → tự động access đúng pages
- Không cần sửa code frontend/backend

### 2. **Flexibility**
- Campus Admin có thể access admin pages
- Không bị restrict bởi hardcoded role list
- Easy to adjust permissions per role

### 3. **Security**
- Backend checks permissions via Guards
- Frontend checks permissions for UI
- Double-layer security (frontend + backend)

### 4. **Phase 3 Ready**
- Multi-campus: CampusScopeGuard auto-filters data
- Permission-based: No code changes needed
- Feature flag: Just flip MULTI_CAMPUS_ENABLED

---

## 📋 Migration Checklist

- [x] Remove `allowedRoles` from all routes
- [x] Add `requiredPermissions` to protected routes
- [x] Update ProtectedRoute priority (permission > role)
- [x] Update ROLE_NAMES to match backend
- [x] Add ROLE_CODES (roleCode from backend)
- [x] Update ROLE_IDS for new roles
- [x] Remove ROLE_SLUGS (deprecated)
- [x] Update getDefaultDashboard logic
- [x] Test Campus Admin can access /dashboard
- [x] Test permission-based page access

---

## 🧪 Testing Guide

### Test Permission-Based Access
1. Login as Campus Admin
2. Should see Dashboard
3. Should see Users, Rooms, Schedules (if has permission)
4. Should NOT see Roles (unless granted)

### Test Role-Based Fallback (Legacy)
1. Login as Lecturer
2. Should redirect to /home (no admin permissions)
3. Should NOT access /dashboard

### Test New Role Creation
1. Training Officer creates "Lab Manager" role
2. Grant permissions: rooms.read, rooms.update, bookings.read
3. Assign to user
4. User should access Rooms & Bookings pages automatically

---

## 📚 Related Files

**Frontend:**
- `/frontend/src/routes/index.tsx` - Route definitions
- `/frontend/src/components/ProtectedRoute.tsx` - Access control logic
- `/frontend/src/constants/roles.ts` - Role constants
- `/frontend/src/utils/permissions.ts` - Permission constants

**Backend:**
- `/backendAPI/src/config/app.config.ts` - ROLE_LEVEL_REFERENCE
- `/backendAPI/src/database/schemas/role.schema.ts` - roleCode, roleLevel
- `/backendAPI/src/common/guards/permissions.guard.ts` - Permission checks
- `/backendAPI/src/common/guards/campus-scope.guard.ts` - Campus filtering

---

## 🎓 Key Concepts

### Permission Format
```
resource.action
users.read
users.create
rooms.update
bookings.approve
```

### Role Hierarchy (roleLevel)
```
0: Super Admin (cross-campus, all permissions)
1: Campus Admin (campus-wide management)
2: Training Officer (schedules, rooms, users)
3: Lecturer/Security (department/room level)
4: Student (basic access)
```

### Access Control Flow
```
User Login
  ↓
JWT with permissions array
  ↓
Frontend: Check requiredPermissions
  ↓ (if has permission)
AdminLayout → Page Component
  ↓
Backend: PermissionsGuard checks user.permissions
  ↓
CampusScopeGuard filters data by campusId
  ↓
Service returns campus-scoped data
```

---

**Date:** January 17, 2026  
**Author:** GitHub Copilot  
**Status:** ✅ Completed & Tested
