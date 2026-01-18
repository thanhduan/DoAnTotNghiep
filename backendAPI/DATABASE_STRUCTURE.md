# DATABASE STRUCTURE - Classroom Management System
## 📋 Mô tả dự án
**Hệ thống quản lý mượn trả phòng học tích hợp IoT**

### Tính năng chính:
- ✅ Request/Approval booking phòng học
- ✅ Transfer system (chuyển giao chìa khóa giữa các giảng viên)
- ✅ Notification system (thông báo realtime)
- ✅ Incident reporting (báo cáo hư hỏng phòng học)
- ✅ IoT integration (mở/khóa phòng qua face recognition, fingerprint, RFID, mobile app)
- ✅ Access logs (tracking lịch sử ra vào phòng)

---

## 👥 ACTORS (6 Roles)

### 1. **Super Admin** (roleLevel: 0, scope: GLOBAL)
- Quản trị viên tối cao
- Quản lý toàn hệ thống, truy cập mọi campus
- campusId: `null` (global role)
- **Permissions**: ALL (49 permissions)

### 2. **Campus Admin** (roleLevel: 1, scope: CAMPUS)
- Quản lý campus (tự động tạo khi có campus mới)
- Quản lý toàn bộ hoạt động campus
- campusId: tied to specific campus
- **Permissions**: ALL except `campus.manage` (48 permissions)

### 3. **Training Officer** (roleLevel: 2, scope: CAMPUS)
- Nhân viên đào tạo
- Quản lý lịch học, phòng học, duyệt booking
- **Key Permissions**:
  - users.read
  - rooms.* (full CRUD)
  - schedules.* (full CRUD)
  - bookings.* (full CRUD + approve)
  - incidents (read/update/resolve)
  - notifications (create/read)
  - access_logs.read

### 4. **Lecturer** (roleLevel: 3, scope: SELF)
- Giảng viên
- Dạy học, booking phòng, báo cáo sự cố, transfer phòng
- **Key Permissions**:
  - rooms.read, schedules (read/update)
  - bookings.* (CRUD for self)
  - lockers (read/unlock)
  - transfers.* (full control)
  - incidents.create
  - notifications.read

### 5. **Student** (roleLevel: 4, scope: SELF)
- Sinh viên
- Xem lịch học, booking phòng tự học
- **Key Permissions**:
  - rooms.read, schedules.read
  - bookings.* (CRUD for self-study only)
  - lockers.read
  - notifications.read

### 6. **Security** (roleLevel: 3, scope: CAMPUS)
- Bảo vệ
- Giám sát an ninh, báo cáo sự cố, xem logs
- **Key Permissions**:
  - rooms.read, schedules.read
  - lockers (read/update)
  - incidents (create/read/update)
  - access_logs.* (full access)
  - notifications.read

---

## 📦 COLLECTIONS (15 Collections)

### 1. **campus** - Campus Information
```javascript
{
  _id: ObjectId,
  campusCode: String,        // "FUCT", "FUTH", etc.
  campusName: String,
  address: String,
  province: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **roles** - User Roles
```javascript
{
  _id: ObjectId,
  roleName: String,          // "Super Admin", "Campus Admin", etc.
  roleCode: String,          // "SUPER_ADMIN", "CAMPUS_ADMIN", etc.
  campusId: ObjectId | null, // null = global role
  roleLevel: Number,         // 0-4 (lower = higher privilege)
  scope: String,             // "GLOBAL", "CAMPUS", "SELF"
  canManageRoles: Boolean,
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. **permissions** - System Permissions (49 permissions)
```javascript
{
  _id: ObjectId,
  permissionName: String,    // "users.create", "rooms.read", etc.
  permissionCode: String,    // "CREATE_USER", "READ_ROOM", etc.
  resource: String,          // "users", "rooms", "schedules", etc.
  action: String,            // "create", "read", "update", "delete", etc.
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Resources:**
- users (5 permissions: create, read, update, delete, manage)
- roles (5 permissions)
- rooms (5 permissions)
- schedules (5 permissions)
- bookings (6 permissions: + approve, manage)
- lockers (4 permissions: read, update, unlock, manage)
- campus (1 permission: manage)
- settings (3 permissions: read, update, manage)
- transfers (5 permissions: create, read, approve, reject, cancel)
- notifications (4 permissions)
- incidents (4 permissions: create, read, update, resolve)
- access_logs (2 permissions: read, manage)

### 4. **role_permissions** - Role-Permission Mapping
```javascript
{
  _id: ObjectId,
  roleId: ObjectId,
  permissionId: ObjectId,
  isActive: Boolean,
  grantedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. **users** - System Users
```javascript
{
  _id: ObjectId,
  googleId: String,
  email: String,             // Unique
  fullName: String,
  avatar: String,
  role: String,              // roleCode (for quick access)
  roleId: ObjectId,
  employeeId: String,        // For staff
  studentId: String,         // For students
  department: String,
  phone: String,
  campusId: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. **time_slots** - Time Slots
```javascript
{
  _id: ObjectId,
  slotType: String,          // "OLDSLOT", "NEWSLOT"
  slotNumber: Number,        // 1-8 (OLDSLOT), 1-5 (NEWSLOT)
  slotName: String,          // "SLOT 1", "SLOT 2", etc.
  startTime: String,         // "07:00"
  endTime: String,           // "08:30"
  description: String,       // "Tiết 1-2", "Tiết 1-3", etc.
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
- **OLDSLOT**: 8 slots (1.5 hours each)
- **NEWSLOT**: 5 slots (2.25 hours each)

### 7. **rooms** - Classrooms
```javascript
{
  _id: ObjectId,
  roomCode: String,          // "G301", "G302", etc.
  roomName: String,
  building: String,          // "G", "H", etc.
  floor: Number,
  capacity: Number,
  roomType: String,          // "classroom", "lab", "meeting", etc.
  facilities: [String],      // ["projector", "whiteboard", etc.]
  lockerNumber: Number,      // Number of lockers in room
  campusId: ObjectId,
  status: String,            // "available", "occupied", "maintenance"
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. **lockers** - IoT Smart Locks
```javascript
{
  _id: ObjectId,
  lockerNumber: Number,
  roomId: ObjectId,
  position: String,
  deviceId: String,          // "ESP32_G301_01"
  campusId: ObjectId,
  status: String,            // "available", "occupied", "maintenance"
  batteryLevel: Number,      // 0-100
  lastConnection: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. **schedules** - Teaching Schedules
```javascript
{
  _id: ObjectId,
  roomId: ObjectId,
  lecturerId: ObjectId,
  campusId: ObjectId,
  subjectCode: String,       // "PRN231", "SWP391", etc.
  subjectName: String,
  classCode: String,         // "SE1801", "SE1802", etc.
  dateStart: Date,
  dayOfWeek: Number,         // 2-7 (Monday-Saturday)
  slotType: String,          // "OLDSLOT", "NEWSLOT"
  slotNumber: Number,
  timeSlotId: ObjectId,
  startTime: String,
  endTime: String,
  semester: String,          // "Spring2025", "Fall2025", etc.
  source: String,            // "manual", "imported", "api"
  status: String,            // "scheduled", "ongoing", "completed", "cancelled"
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 10. **bookings** - Room Booking Requests ✨ NEW
```javascript
{
  _id: ObjectId,
  roomId: ObjectId,
  requesterId: ObjectId,     // User who requested
  campusId: ObjectId,
  bookingType: String,       // "teaching", "meeting", "self_study"
  purpose: String,
  dateStart: Date,
  dateEnd: Date,
  slotType: String,
  slotNumber: Number,
  timeSlotId: ObjectId,
  startTime: String,
  endTime: String,
  status: String,            // "pending", "approved", "rejected", "cancelled", "completed"
  approvedBy: ObjectId,      // Training Officer who approved
  approvedAt: Date,
  rejectedReason: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 11. **transfers** - Key Transfer System ✨ NEW
```javascript
{
  _id: ObjectId,
  roomId: ObjectId,
  lockerId: ObjectId,
  fromUserId: ObjectId,      // Lecturer handing over key
  toUserId: ObjectId,        // Lecturer receiving key
  campusId: ObjectId,
  fromScheduleId: ObjectId,  // Previous class schedule
  toScheduleId: ObjectId,    // Next class schedule
  transferDate: Date,
  reason: String,            // "Dạy liên tiếp"
  status: String,            // "pending", "approved", "rejected", "cancelled", "completed"
  approvedAt: Date,
  completedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Use Case**: Lecturer A finishes teaching at 09:15, Lecturer B starts at 09:30. Instead of returning key to locker, A directly hands over to B.

### 12. **notifications** - Push Notifications ✨ NEW
```javascript
{
  _id: ObjectId,
  recipientId: ObjectId,     // User receiving notification
  senderId: ObjectId,        // User who triggered (null = system)
  campusId: ObjectId,
  type: String,              // "incident_reported", "booking_approved", "booking_rejected", 
                             // "transfer_request", "schedule_change", "maintenance_alert"
  title: String,
  message: String,
  data: Object,              // Additional data (incidentId, bookingId, etc.)
  priority: String,          // "low", "medium", "high", "urgent"
  isRead: Boolean,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 13. **incidents** - Damage Reports ✨ NEW
```javascript
{
  _id: ObjectId,
  roomId: ObjectId,
  reporterId: ObjectId,      // Lecturer or Security who reported
  campusId: ObjectId,
  incidentType: String,      // "equipment_damage", "cleanliness", "safety", "other"
  title: String,
  description: String,
  severity: String,          // "low", "medium", "high", "critical"
  status: String,            // "reported", "in_progress", "resolved", "closed"
  priority: String,
  assignedTo: ObjectId,      // Training Officer assigned
  reportedAt: Date,
  resolvedAt: Date,
  resolvedBy: ObjectId,
  resolution: String,
  images: [String],          // Array of image URLs
  createdAt: Date,
  updatedAt: Date
}
```

**Use Case**: Lecturer reports broken projector → Notification sent to Training Officer → Assigned to maintenance → Status updated → Notification sent back

### 14. **access_logs** - IoT Security Logs ✨ NEW
```javascript
{
  _id: ObjectId,
  roomId: ObjectId,
  lockerId: ObjectId,
  userId: ObjectId,          // User who accessed
  campusId: ObjectId,
  scheduleId: ObjectId,      // Related schedule (if any)
  action: String,            // "unlock", "lock", "access_denied", "manual_override"
  method: String,            // "face_recognition", "fingerprint", "rfid", "mobile_app", "manual"
  success: Boolean,
  accessTime: Date,
  deviceId: String,          // "ESP32_G301_01"
  ipAddress: String,
  location: String,          // "Tòa G - Tầng 3 - Phòng G301"
  reason: String,            // "Scheduled class", "Security patrol", etc.
  createdAt: Date
}
```

**Use Case**: Track every unlock/lock action via IoT devices. Security can review access patterns and detect anomalies.

### 15. **settings** - System Settings
```javascript
{
  key: String,               // Unique with campusId
  value: Any,                // String, Number, Boolean, Object
  campusId: ObjectId | null, // null = global setting
  description: String,
  category: String,          // "general", "security", "notification", etc.
  updatedAt: Date
}
```

---

## 🔐 PERMISSION MAPPING

### Super Admin (49 permissions)
✅ ALL permissions

### Campus Admin (48 permissions)
✅ ALL except `campus.manage`

### Training Officer (24 permissions)
✅ users.read
✅ rooms.* (5)
✅ schedules.* (5)
✅ bookings.* (6)
✅ lockers.read
✅ incidents (read, update, resolve)
✅ notifications (create, read)
✅ access_logs.read

### Lecturer (19 permissions)
✅ users.read
✅ rooms.read
✅ schedules (read, update)
✅ bookings.* (4)
✅ lockers (read, unlock)
✅ transfers.* (5)
✅ incidents.create
✅ notifications.read

### Student (7 permissions)
✅ rooms.read
✅ schedules.read
✅ bookings.* (4 - self only)
✅ lockers.read
✅ notifications.read

### Security (11 permissions)
✅ rooms.read
✅ schedules.read
✅ lockers (read, update)
✅ incidents (create, read, update)
✅ access_logs.* (2)
✅ notifications.read

---

## 📊 DATA FLOW EXAMPLES

### 1. **Booking Flow**
```
Student/Lecturer → Create Booking (status: pending)
                ↓
Training Officer → Review & Approve/Reject
                ↓
System → Send Notification to Requester
                ↓
Approved → Can unlock room via IoT
```

### 2. **Transfer Flow**
```
Lecturer A (finishes class) → Create Transfer Request
                            ↓
Lecturer B (next class) → Approve Transfer
                         ↓
System → Update locker status (currentUser = Lecturer B)
       → No need to return key to locker
       → Access Log recorded
```

### 3. **Incident Reporting Flow**
```
Lecturer/Security → Report Incident
                  ↓
System → Create Notification → Training Officer
                              ↓
Training Officer → Assign to maintenance
                 → Update status (in_progress)
                 ↓
Maintenance → Resolve incident
            → Upload resolution notes
            ↓
System → Notification → Original Reporter (resolved)
```

### 4. **IoT Access Flow**
```
User → Approach room → Face Recognition/Fingerprint/RFID
     ↓
IoT Device (ESP32) → Verify with Backend API
                   ↓
Backend → Check schedule/booking
        → Check user permissions
        → Validate time slot
        ↓
IoT Device → Unlock/Lock door
           ↓
System → Create Access Log
       → Update locker status
```

---

## 🚀 INDEXES (Performance Optimization)

### High Priority (Frequent Queries)
- `users`: email (unique), roleId + isActive, campusId
- `bookings`: roomId + dateStart + status, requesterId + status
- `schedules`: roomId + dateStart, lecturerId, campusId
- `notifications`: recipientId + isRead, campusId + createdAt (desc)
- `access_logs`: roomId + accessTime (desc), userId + accessTime (desc)
- `incidents`: roomId + status, assignedTo + status, campusId + status + severity

### Medium Priority
- `transfers`: roomId + transferDate, fromUserId + status, toUserId + status
- `lockers`: roomId + status, deviceId (unique)
- `rooms`: roomCode + campusId (unique), campusId + status

---

## 💡 BUSINESS RULES

### Booking Rules
1. Cannot book if room is already scheduled
2. Cannot book past dates
3. Students can only book for "self_study" type
4. Lecturers can book for "teaching" or "meeting"
5. Max 2 hours for student bookings
6. Training Officer approval required for all bookings

### Transfer Rules
1. Can only transfer if both users have consecutive schedules
2. Automatic if both are in same campus
3. Tracks complete chain of custody
4. Cannot transfer if incident is reported for the room

### Access Control Rules
1. Face Recognition: Primary method for lecturers
2. RFID: For security and staff
3. Mobile App: Emergency unlock (with permissions)
4. Manual Override: Super Admin only
5. Auto-lock after class ends (configurable delay)

### Incident Rules
1. Critical incidents → Immediate notification to Campus Admin
2. High severity → Lock room automatically
3. Cannot book room with unresolved incidents
4. Training Officer must assign and track resolution

---

## 📝 SAMPLE DATA

### Users (7 users)
- 1 Super Admin
- 1 Campus Admin (auto-created)
- 1 Training Officer
- 2 Lecturers
- 1 Student
- 1 Security

### Schedules (4 schedules)
- PRN231, SWP391, SWD392 across 2 rooms

### Bookings (2 bookings)
- 1 approved (Lecturer)
- 1 pending (Student)

### Transfers (1 transfer)
- Lecturer A → Lecturer B (completed)

### Incidents (2 incidents)
- Equipment damage (in_progress)
- Cleanliness issue (resolved)

### Notifications (2 notifications)
- Incident alert (unread)
- Booking pending (unread)

### Access Logs (3 logs)
- 2 unlock/lock by Lecturer
- 1 security patrol

---

## ✅ CHECKLIST - Đảm bảo chuẩn nghiệp vụ

### Actors ✅
- [x] Super Admin
- [x] Campus Admin (auto-created)
- [x] Training Officer
- [x] Lecturer
- [x] Student
- [x] Security

### Core Features ✅
- [x] Request/Approval booking system
- [x] Transfer system (key handover)
- [x] Notification system (realtime)
- [x] Incident reporting
- [x] IoT integration (multiple methods)
- [x] Access logs (security tracking)

### Data Integrity ✅
- [x] Proper indexes for performance
- [x] Unique constraints (email, deviceId, etc.)
- [x] Foreign key references (via ObjectId)
- [x] Status tracking for all workflows
- [x] Audit trails (createdAt, updatedAt, access logs)

### Security ✅
- [x] Role-based permissions
- [x] Campus isolation
- [x] IoT device authentication
- [x] Access logging
- [x] Manual override controls

---

**Database is ready for production! 🎉**
