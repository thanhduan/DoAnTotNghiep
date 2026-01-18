// ============================================================
// MONGODB SEED SCRIPT - CLEAN VERSION
// FPT University Classroom Management System
// ============================================================
// Purpose: Initialize database with 1 campus and sample data
// - 1 Campus (Can Tho)
// - 2 Roles: Super Admin (global), Campus Manager (campus-specific)
// - Full permissions
// - 1 Super Admin user (duanntce171842@fpt.edu.vn)
// - 8 time slots (OLDSLOT)
// - 2 rooms
// - 2 lockers
// - Sample settings
// ============================================================

use('DoAnSP26');

// ============================================================
// STEP 0: DROP EXISTING COLLECTIONS
// ============================================================
print('🧹 Cleaning up existing collections...\n');

db.roles.drop();
db.permissions.drop();
db.role_permissions.drop();
db.campus.drop();
db.users.drop();
db.rooms.drop();
db.schedules.drop();
db.lockers.drop();
db.settings.drop();
db.time_slots.drop();
db.bookings.drop();
db.transfers.drop();
db.notifications.drop();
db.incidents.drop();
db.access_logs.drop();

print('✅ All collections dropped\n');

// ============================================================
// STEP 1: INSERT CAMPUS
// ============================================================
print('🏫 Creating Campus...');

const campusResult = db.campus.insertOne({
  _id: ObjectId("693ad44426d23ee0a8bf08f5"),
  campusCode: "FUCT",
  campusName: "FPT University Can Tho",
  address: "600 Nguyen Van Cu, An Hoa, Ninh Kieu, Can Tho",
  province: "Can Tho",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print(`✅ Inserted campus: ${campusResult.insertedId}`);

// ============================================================
// STEP 2: INSERT ROLES
// ============================================================
print('\n👔 Creating Roles...');

const rolesResult = db.roles.insertMany([
  {
    _id: ObjectId("670000000000000000000001"),
    roleName: "Super Admin",
    roleCode: "SUPER_ADMIN",
    campusId: null,  // Global role - null means not tied to any campus
    roleLevel: 0,
    scope: "GLOBAL",
    canManageRoles: true,
    description: "Quản trị viên tối cao - Quản lý toàn hệ thống, có thể truy cập mọi campus",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("670000000000000000000003"),
    roleName: "Training Officer",
    roleCode: "TRAINING_OFFICER",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),  // Tied to Can Tho campus
    roleLevel: 2,
    scope: "CAMPUS",
    canManageRoles: false,
    description: "Nhân viên đào tạo - Quản lý lịch học, phòng học, duyệt booking",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("670000000000000000000004"),
    roleName: "Lecturer",
    roleCode: "LECTURER",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),  // Tied to Can Tho campus
    roleLevel: 3,
    scope: "SELF",
    canManageRoles: false,
    description: "Giảng viên - Dạy học, booking phòng, báo cáo sự cố, transfer phòng",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("670000000000000000000005"),
    roleName: "Student",
    roleCode: "STUDENT",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),  // Tied to Can Tho campus
    roleLevel: 4,
    scope: "SELF",
    canManageRoles: false,
    description: "Sinh viên - Xem lịch học, booking phòng tự học",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("670000000000000000000006"),
    roleName: "Security",
    roleCode: "SECURITY",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),  // Tied to Can Tho campus
    roleLevel: 3,
    scope: "CAMPUS",
    canManageRoles: false,
    description: "Bảo vệ - Giám sát an ninh, báo cáo sự cố, xem access logs",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print(`✅ Inserted ${Object.keys(rolesResult.insertedIds).length} roles`);

// ============================================================
// STEP 3: INSERT PERMISSIONS
// ============================================================
print('\n🔐 Creating Permissions...');

const permissionsResult = db.permissions.insertMany([
  // Users permissions
  { _id: ObjectId("680000000000000000000001"), permissionName: "users.create", permissionCode: "CREATE_USER", resource: "users", action: "create", description: "Tạo người dùng mới", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000002"), permissionName: "users.read", permissionCode: "READ_USER", resource: "users", action: "read", description: "Xem thông tin người dùng", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000003"), permissionName: "users.update", permissionCode: "UPDATE_USER", resource: "users", action: "update", description: "Cập nhật người dùng", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000004"), permissionName: "users.delete", permissionCode: "DELETE_USER", resource: "users", action: "delete", description: "Xóa người dùng", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000005"), permissionName: "users.manage", permissionCode: "MANAGE_USERS", resource: "users", action: "manage", description: "Quản lý toàn bộ users", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Roles permissions
  { _id: ObjectId("680000000000000000000006"), permissionName: "roles.create", permissionCode: "CREATE_ROLE", resource: "roles", action: "create", description: "Tạo vai trò mới", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000007"), permissionName: "roles.read", permissionCode: "READ_ROLE", resource: "roles", action: "read", description: "Xem thông tin vai trò", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000008"), permissionName: "roles.update", permissionCode: "UPDATE_ROLE", resource: "roles", action: "update", description: "Cập nhật vai trò", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000009"), permissionName: "roles.delete", permissionCode: "DELETE_ROLE", resource: "roles", action: "delete", description: "Xóa vai trò", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000010"), permissionName: "roles.manage", permissionCode: "MANAGE_ROLES", resource: "roles", action: "manage", description: "Quản lý toàn bộ vai trò", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Rooms permissions
  { _id: ObjectId("680000000000000000000011"), permissionName: "rooms.create", permissionCode: "CREATE_ROOM", resource: "rooms", action: "create", description: "Tạo phòng học mới", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000012"), permissionName: "rooms.read", permissionCode: "READ_ROOM", resource: "rooms", action: "read", description: "Xem thông tin phòng học", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000013"), permissionName: "rooms.update", permissionCode: "UPDATE_ROOM", resource: "rooms", action: "update", description: "Cập nhật phòng học", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000014"), permissionName: "rooms.delete", permissionCode: "DELETE_ROOM", resource: "rooms", action: "delete", description: "Xóa phòng học", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000015"), permissionName: "rooms.manage", permissionCode: "MANAGE_ROOMS", resource: "rooms", action: "manage", description: "Quản lý toàn bộ phòng học", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Schedules permissions
  { _id: ObjectId("680000000000000000000016"), permissionName: "schedules.create", permissionCode: "CREATE_SCHEDULE", resource: "schedules", action: "create", description: "Tạo lịch học mới", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000017"), permissionName: "schedules.read", permissionCode: "READ_SCHEDULE", resource: "schedules", action: "read", description: "Xem lịch học", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000018"), permissionName: "schedules.update", permissionCode: "UPDATE_SCHEDULE", resource: "schedules", action: "update", description: "Cập nhật lịch học", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000019"), permissionName: "schedules.delete", permissionCode: "DELETE_SCHEDULE", resource: "schedules", action: "delete", description: "Xóa lịch học", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000020"), permissionName: "schedules.manage", permissionCode: "MANAGE_SCHEDULES", resource: "schedules", action: "manage", description: "Quản lý toàn bộ lịch học", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Bookings permissions
  { _id: ObjectId("680000000000000000000021"), permissionName: "bookings.create", permissionCode: "CREATE_BOOKING", resource: "bookings", action: "create", description: "Tạo booking phòng", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000022"), permissionName: "bookings.read", permissionCode: "READ_BOOKING", resource: "bookings", action: "read", description: "Xem booking", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000023"), permissionName: "bookings.update", permissionCode: "UPDATE_BOOKING", resource: "bookings", action: "update", description: "Cập nhật booking", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000024"), permissionName: "bookings.delete", permissionCode: "DELETE_BOOKING", resource: "bookings", action: "delete", description: "Xóa booking", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000025"), permissionName: "bookings.approve", permissionCode: "APPROVE_BOOKING", resource: "bookings", action: "approve", description: "Duyệt booking", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000026"), permissionName: "bookings.manage", permissionCode: "MANAGE_BOOKINGS", resource: "bookings", action: "manage", description: "Quản lý toàn bộ bookings", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Lockers permissions
  { _id: ObjectId("680000000000000000000027"), permissionName: "lockers.read", permissionCode: "READ_LOCKER", resource: "lockers", action: "read", description: "Xem thông tin tủ khóa", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000028"), permissionName: "lockers.update", permissionCode: "UPDATE_LOCKER", resource: "lockers", action: "update", description: "Cập nhật tủ khóa", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000029"), permissionName: "lockers.unlock", permissionCode: "UNLOCK_LOCKER", resource: "lockers", action: "unlock", description: "Mở khóa tủ", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000030"), permissionName: "lockers.manage", permissionCode: "MANAGE_LOCKERS", resource: "lockers", action: "manage", description: "Quản lý toàn bộ tủ khóa", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Campus permission
  { _id: ObjectId("680000000000000000000031"), permissionName: "campus.manage", permissionCode: "MANAGE_CAMPUS", resource: "campus", action: "manage", description: "Quản lý campus", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Settings permissions
  { _id: ObjectId("680000000000000000000032"), permissionName: "settings.read", permissionCode: "READ_SETTINGS", resource: "settings", action: "read", description: "Xem cài đặt", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000033"), permissionName: "settings.update", permissionCode: "UPDATE_SETTINGS", resource: "settings", action: "update", description: "Cập nhật cài đặt", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000034"), permissionName: "settings.manage", permissionCode: "MANAGE_SETTINGS", resource: "settings", action: "manage", description: "Quản lý toàn bộ cài đặt", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Transfers permissions (for key handover between lecturers)
  { _id: ObjectId("680000000000000000000035"), permissionName: "transfers.create", permissionCode: "CREATE_TRANSFER", resource: "transfers", action: "create", description: "Tạo yêu cầu chuyển giao phòng", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000036"), permissionName: "transfers.read", permissionCode: "READ_TRANSFER", resource: "transfers", action: "read", description: "Xem thông tin chuyển giao", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000037"), permissionName: "transfers.approve", permissionCode: "APPROVE_TRANSFER", resource: "transfers", action: "approve", description: "Chấp nhận chuyển giao", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000038"), permissionName: "transfers.reject", permissionCode: "REJECT_TRANSFER", resource: "transfers", action: "reject", description: "Từ chối chuyển giao", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000039"), permissionName: "transfers.cancel", permissionCode: "CANCEL_TRANSFER", resource: "transfers", action: "cancel", description: "Hủy chuyển giao", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Notifications permissions
  { _id: ObjectId("680000000000000000000040"), permissionName: "notifications.create", permissionCode: "CREATE_NOTIFICATION", resource: "notifications", action: "create", description: "Tạo thông báo", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000041"), permissionName: "notifications.read", permissionCode: "READ_NOTIFICATION", resource: "notifications", action: "read", description: "Xem thông báo", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000042"), permissionName: "notifications.update", permissionCode: "UPDATE_NOTIFICATION", resource: "notifications", action: "update", description: "Cập nhật thông báo", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000043"), permissionName: "notifications.delete", permissionCode: "DELETE_NOTIFICATION", resource: "notifications", action: "delete", description: "Xóa thông báo", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Incidents permissions (for damage reports)
  { _id: ObjectId("680000000000000000000044"), permissionName: "incidents.create", permissionCode: "CREATE_INCIDENT", resource: "incidents", action: "create", description: "Báo cáo sự cố/hư hỏng", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000045"), permissionName: "incidents.read", permissionCode: "READ_INCIDENT", resource: "incidents", action: "read", description: "Xem báo cáo sự cố", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000046"), permissionName: "incidents.update", permissionCode: "UPDATE_INCIDENT", resource: "incidents", action: "update", description: "Cập nhật sự cố", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000047"), permissionName: "incidents.resolve", permissionCode: "RESOLVE_INCIDENT", resource: "incidents", action: "resolve", description: "Giải quyết sự cố", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Access Logs permissions (IoT security logs)
  { _id: ObjectId("680000000000000000000048"), permissionName: "access_logs.read", permissionCode: "READ_ACCESS_LOG", resource: "access_logs", action: "read", description: "Xem log ra vào phòng", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("680000000000000000000049"), permissionName: "access_logs.manage", permissionCode: "MANAGE_ACCESS_LOGS", resource: "access_logs", action: "manage", description: "Quản lý access logs", isActive: true, createdAt: new Date(), updatedAt: new Date() }
]);

print(`✅ Inserted ${Object.keys(permissionsResult.insertedIds).length} permissions`);

// ============================================================
// STEP 4: INSERT ROLE_PERMISSIONS MAPPING
// ============================================================
print('\n🔗 Mapping Roles to Permissions...');

// Get all permissions
const allPermissions = db.permissions.find({}).toArray();

// Super Admin gets ALL permissions
const superAdminPermissions = allPermissions.map(p => ({
  roleId: ObjectId("670000000000000000000001"),
  permissionId: p._id,
  isActive: true,
  grantedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
}));

// Training Officer: users.read, rooms.*, schedules.*, bookings.*, lockers.read, incidents (read/update/resolve), notifications (create/read), access_logs.read
const trainingOfficerPermissions = allPermissions
  .filter(p => [
    "users.read",
    "rooms.create", "rooms.read", "rooms.update", "rooms.delete", "rooms.manage",
    "schedules.create", "schedules.read", "schedules.update", "schedules.delete", "schedules.manage",
    "bookings.create", "bookings.read", "bookings.update", "bookings.delete", "bookings.approve", "bookings.manage",
    "lockers.read",
    "incidents.read", "incidents.update", "incidents.resolve",
    "notifications.create", "notifications.read",
    "access_logs.read"
  ].includes(p.permissionName))
  .map(p => ({
    roleId: ObjectId("670000000000000000000003"),
    permissionId: p._id,
    isActive: true,
    grantedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }));

// Lecturer: users.read, rooms.read, schedules (read/update), bookings (create/read/update/delete), lockers (read/unlock), transfers.*, incidents.create, notifications.read
const lecturerPermissions = allPermissions
  .filter(p => [
    "users.read",
    "rooms.read",
    "schedules.read", "schedules.update",
    "bookings.create", "bookings.read", "bookings.update", "bookings.delete",
    "lockers.read", "lockers.unlock",
    "transfers.create", "transfers.read", "transfers.approve", "transfers.reject", "transfers.cancel",
    "incidents.create",
    "notifications.read"
  ].includes(p.permissionName))
  .map(p => ({
    roleId: ObjectId("670000000000000000000004"),
    permissionId: p._id,
    isActive: true,
    grantedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }));

// Student: rooms.read, schedules.read, bookings (create/read/update/delete - self only), lockers.read, notifications.read
const studentPermissions = allPermissions
  .filter(p => [
    "rooms.read",
    "schedules.read",
    "bookings.create", "bookings.read", "bookings.update", "bookings.delete",
    "lockers.read",
    "notifications.read"
  ].includes(p.permissionName))
  .map(p => ({
    roleId: ObjectId("670000000000000000000005"),
    permissionId: p._id,
    isActive: true,
    grantedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }));

// Security: rooms.read, schedules.read, lockers (read/update), incidents (create/read/update), access_logs (read/manage), notifications.read
const securityPermissions = allPermissions
  .filter(p => [
    "rooms.read",
    "schedules.read",
    "lockers.read", "lockers.update",
    "incidents.create", "incidents.read", "incidents.update",
    "access_logs.read", "access_logs.manage",
    "notifications.read"
  ].includes(p.permissionName))
  .map(p => ({
    roleId: ObjectId("670000000000000000000006"),
    permissionId: p._id,
    isActive: true,
    grantedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }));

const rolePermissionsResult = db.role_permissions.insertMany([
  ...superAdminPermissions,
  ...trainingOfficerPermissions,
  ...lecturerPermissions,
  ...studentPermissions,
  ...securityPermissions
]);

print(`✅ Inserted ${Object.keys(rolePermissionsResult.insertedIds).length} role-permission mappings`);

// ============================================================
// STEP 5: INSERT USERS (Super Admin + Lecturers)
// ============================================================
print('\n👤 Creating Users...');

const usersResult = db.users.insertMany([
  // Super Admin
  {
    _id: ObjectId("693ad44526d23ee0a8bf0909"),
    googleId: "107549720956923965766",
    email: "duanntce171842@fpt.edu.vn",
    fullName: "Nguyễn Thanh Duẩn",
    avatar: "https://lh3.googleusercontent.com/a/default",
    roleId: ObjectId("670000000000000000000001"),  // Super Admin
    employeeId: "CE171842",
    department: "Software Engineering",
    phone: "0916989108",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),  // Can Tho campus
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Training Officer
  {
    _id: ObjectId("693ad44526d23ee0a8bf091c"),
    googleId: null,
    email: "training.officer@fpt.edu.vn",
    fullName: "Lê Thị Hoa",
    avatar: "",
    roleId: ObjectId("670000000000000000000003"),
    employeeId: "TO001",
    department: "Training Department",
    phone: "0292123457",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Lecturer 1
  {
    _id: ObjectId("693ad44526d23ee0a8bf090a"),
    googleId: "lecturer_001",
    email: "thanhduan0780@fpt.edu.vn",
    fullName: "Trần Văn Giảng",
    avatar: "",
    roleId: ObjectId("670000000000000000000004"),  // Lecturer role
    employeeId: "GV001",
    department: "Software Engineering",
    phone: "0912345678",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Lecturer 2
  {
    _id: ObjectId("693ad44526d23ee0a8bf091a"),
    googleId: "lecturer_002",
    email: "sangnqCE150621@fpt.edu.vn",
    fullName: "Nguyễn Quang Sang",
    avatar: "",
    roleId: ObjectId("670000000000000000000004"),  // Lecturer role
    employeeId: "GV002",
    department: "Software Engineering",
    phone: "0987654321",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Student
  {
    _id: ObjectId("693ad44526d23ee0a8bf091d"),
    googleId: null,
    email: "student1@fpt.edu.vn",
    fullName: "Phạm Văn An",
    avatar: "",
    roleId: ObjectId("670000000000000000000005"),
    studentId: "SE171234",
    department: "Software Engineering",
    phone: "0912345679",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Security
  {
    _id: ObjectId("693ad44526d23ee0a8bf091e"),
    googleId: null,
    email: "security1@fpt.edu.vn",
    fullName: "Nguyễn Văn Bảo",
    avatar: "",
    roleId: ObjectId("670000000000000000000006"),
    employeeId: "SEC001",
    department: "Security",
    phone: "0292123458",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print(`✅ Inserted ${Object.keys(usersResult.insertedIds).length} users`);

// ============================================================
// STEP 6: INSERT TIME SLOTS (8 OLDSLOT + 5 NEWSLOT)
// ============================================================
print('\n⏰ Creating Time Slots...');

const timeSlotsResult = db.time_slots.insertMany([
  // OLDSLOT (8 slots)
  { _id: ObjectId("693ad44526d23ee0a8bf08f6"), slotType: "OLDSLOT", slotNumber: 1, slotName: "SLOT 1", startTime: "07:00", endTime: "08:30", description: "Tiết 1-2", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf08f7"), slotType: "OLDSLOT", slotNumber: 2, slotName: "SLOT 2", startTime: "08:45", endTime: "10:15", description: "Tiết 3-4", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf08f8"), slotType: "OLDSLOT", slotNumber: 3, slotName: "SLOT 3", startTime: "10:30", endTime: "12:00", description: "Tiết 5-6", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf08f9"), slotType: "OLDSLOT", slotNumber: 4, slotName: "SLOT 4", startTime: "12:45", endTime: "14:15", description: "Tiết 7-8", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf08fa"), slotType: "OLDSLOT", slotNumber: 5, slotName: "SLOT 5", startTime: "14:30", endTime: "16:00", description: "Tiết 9-10", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf08fb"), slotType: "OLDSLOT", slotNumber: 6, slotName: "SLOT 6", startTime: "16:15", endTime: "17:45", description: "Tiết 11-12", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf08fc"), slotType: "OLDSLOT", slotNumber: 7, slotName: "SLOT 7", startTime: "18:00", endTime: "19:30", description: "Tiết 13-14", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf08fd"), slotType: "OLDSLOT", slotNumber: 8, slotName: "SLOT 8", startTime: "19:45", endTime: "21:15", description: "Tiết 15-16", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // NEWSLOT (5 slots)
  { _id: ObjectId("693ad44526d23ee0a8bf08fe"), slotType: "NEWSLOT", slotNumber: 1, slotName: "SLOT 1", startTime: "07:00", endTime: "09:15", description: "Tiết 1-3", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf08ff"), slotType: "NEWSLOT", slotNumber: 2, slotName: "SLOT 2", startTime: "09:30", endTime: "11:45", description: "Tiết 4-6", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf0900"), slotType: "NEWSLOT", slotNumber: 3, slotName: "SLOT 3", startTime: "13:00", endTime: "15:15", description: "Tiết 7-9", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf0901"), slotType: "NEWSLOT", slotNumber: 4, slotName: "SLOT 4", startTime: "15:30", endTime: "17:45", description: "Tiết 10-12", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId("693ad44526d23ee0a8bf0902"), slotType: "NEWSLOT", slotNumber: 5, slotName: "SLOT 5", startTime: "18:00", endTime: "20:15", description: "Tiết 13-15", isActive: true, createdAt: new Date(), updatedAt: new Date() }
]);

print(`✅ Inserted ${Object.keys(timeSlotsResult.insertedIds).length} time slots (8 OLDSLOT + 5 NEWSLOT)`);

// ============================================================
// STEP 7: INSERT ROOMS
// ============================================================
print('\n🏢 Creating Rooms...');

const roomsResult = db.rooms.insertMany([
  {
    _id: ObjectId("693ad44526d23ee0a8bf090b"),
    roomCode: "G301",
    roomName: "Phòng học G301",
    building: "G",
    floor: 3,
    capacity: 45,
    roomType: "classroom",
    facilities: ["projector", "whiteboard", "air_conditioner", "sound_system"],
    lockerNumber: 2,
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    status: "available",
    description: "Phòng học lý thuyết lớn",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("693ad44526d23ee0a8bf090c"),
    roomCode: "G302",
    roomName: "Phòng học G302",
    building: "G",
    floor: 3,
    capacity: 40,
    roomType: "classroom",
    facilities: ["projector", "whiteboard", "air_conditioner"],
    lockerNumber: 2,
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    status: "available",
    description: "Phòng học lý thuyết",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print(`✅ Inserted ${Object.keys(roomsResult.insertedIds).length} rooms`);

// ============================================================
// STEP 8: INSERT LOCKERS
// ============================================================
print('\n🔐 Creating Lockers...');

const lockersResult = db.lockers.insertMany([
  {
    _id: ObjectId("693ad44526d23ee0a8bf090d"),
    lockerNumber: 1,
    roomId: ObjectId("693ad44526d23ee0a8bf090b"),
    position: "Tòa G - Tầng 3 - Phòng G301",
    deviceId: "ESP32_G301_01",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    status: "available",
    batteryLevel: 95,
    lastConnection: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("693ad44526d23ee0a8bf090e"),
    lockerNumber: 2,
    roomId: ObjectId("693ad44526d23ee0a8bf090c"),
    position: "Tòa G - Tầng 3 - Phòng G302",
    deviceId: "ESP32_G302_01",
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    status: "available",
    batteryLevel: 87,
    lastConnection: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print(`✅ Inserted ${Object.keys(lockersResult.insertedIds).length} lockers`);

// ============================================================
// STEP 9: INSERT SETTINGS
// ============================================================
print('\n⚙️ Creating Settings...');

const settingsResult = db.settings.insertMany([
  // Global settings (campusId = null)
  {
    key: "system_name",
    value: "Classroom Management System",
    campusId: null,
    description: "Tên hệ thống (Global)",
    category: "general",
    updatedAt: new Date()
  },
  {
    key: "enable_face_recognition",
    value: true,
    campusId: null,
    description: "Bật nhận diện khuôn mặt (Global)",
    category: "security",
    updatedAt: new Date()
  },
  {
    key: "enable_fingerprint",
    value: true,
    campusId: null,
    description: "Bật nhận diện vân tay (Global)",
    category: "security",
    updatedAt: new Date()
  },
  
  // Campus-specific settings (Can Tho campus)
  {
    key: "max_overdue_minutes",
    value: 15,
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    description: "Số phút tối đa được trễ - Can Tho campus",
    category: "general",
    updatedAt: new Date()
  },
  {
    key: "notification_before_class",
    value: 30,
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    description: "Thông báo trước giờ học (phút) - Can Tho campus",
    category: "notification",
    updatedAt: new Date()
  },
  {
    key: "auto_unlock_before_class",
    value: 5,
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    description: "Tự động mở khóa trước giờ học (phút) - Can Tho campus",
    category: "general",
    updatedAt: new Date()
  }
]);

print(`✅ Inserted ${Object.keys(settingsResult.insertedIds).length} settings`);

// ============================================================
// STEP 10: INSERT SCHEDULES
// ============================================================
print('\n📅 Creating Schedules...');

const schedulesResult = db.schedules.insertMany([
  // Schedule 1: PRN231 - Room G301 - NEWSLOT 1 - Thứ 2
  {
    _id: ObjectId("693ad44526d23ee0a8bf090f"),
    roomId: ObjectId("693ad44526d23ee0a8bf090b"),  // G301
    lecturerId: ObjectId("693ad44526d23ee0a8bf090a"),  // Trần Văn Giảng
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    subjectCode: "PRN231",
    subjectName: "Building Cross-platform Back-End Application With .NET",
    classCode: "SE1801",
    dateStart: new Date("2025-01-13"),
    dayOfWeek: 2,  // Thứ 2
    slotType: "NEWSLOT",
    slotNumber: 1,
    timeSlotId: ObjectId("693ad44526d23ee0a8bf08fe"),
    startTime: "07:00",
    endTime: "09:15",
    semester: "Spring2025",
    source: "manual",
    status: "scheduled",
    createdBy: ObjectId("693ad44526d23ee0a8bf0909"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Schedule 2: SWP391 - Room G301 - NEWSLOT 2 - Thứ 2
  {
    _id: ObjectId("693ad44526d23ee0a8bf0910"),
    roomId: ObjectId("693ad44526d23ee0a8bf090b"),  // G301
    lecturerId: ObjectId("693ad44526d23ee0a8bf091a"),  // Nguyễn Thị Hương
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    subjectCode: "SWP391",
    subjectName: "Software development project",
    classCode: "SE1802",
    dateStart: new Date("2025-01-13"),
    dayOfWeek: 2,  // Thứ 2
    slotType: "NEWSLOT",
    slotNumber: 2,
    timeSlotId: ObjectId("693ad44526d23ee0a8bf08ff"),
    startTime: "09:30",
    endTime: "11:45",
    semester: "Spring2025",
    source: "manual",
    status: "scheduled",
    createdBy: ObjectId("693ad44526d23ee0a8bf0909"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Schedule 3: PRN231 - Room G302 - OLDSLOT 1 - Thứ 3
  {
    _id: ObjectId("693ad44526d23ee0a8bf0911"),
    roomId: ObjectId("693ad44526d23ee0a8bf090c"),  // G302
    lecturerId: ObjectId("693ad44526d23ee0a8bf090a"),  // Trần Văn Giảng
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    subjectCode: "PRN231",
    subjectName: "Building Cross-platform Back-End Application With .NET",
    classCode: "SE1803",
    dateStart: new Date("2025-01-14"),
    dayOfWeek: 3,  // Thứ 3
    slotType: "OLDSLOT",
    slotNumber: 1,
    timeSlotId: ObjectId("693ad44526d23ee0a8bf08f6"),
    startTime: "07:00",
    endTime: "08:30",
    semester: "Spring2025",
    source: "manual",
    status: "scheduled",
    createdBy: ObjectId("693ad44526d23ee0a8bf0909"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Schedule 4: SWD392 - Room G302 - OLDSLOT 3 - Thứ 4
  {
    _id: ObjectId("693ad44526d23ee0a8bf0912"),
    roomId: ObjectId("693ad44526d23ee0a8bf090c"),  // G302
    lecturerId: ObjectId("693ad44526d23ee0a8bf091a"),  // Nguyễn Thị Hương
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    subjectCode: "SWD392",
    subjectName: "SW Architecture and Design",
    classCode: "SE1804",
    dateStart: new Date("2025-01-15"),
    dayOfWeek: 4,  // Thứ 4
    slotType: "OLDSLOT",
    slotNumber: 3,
    timeSlotId: ObjectId("693ad44526d23ee0a8bf08f8"),
    startTime: "10:30",
    endTime: "12:00",
    semester: "Spring2025",
    source: "manual",
    status: "scheduled",
    createdBy: ObjectId("693ad44526d23ee0a8bf0909"),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print(`✅ Inserted ${Object.keys(schedulesResult.insertedIds).length} schedules`);

// ============================================================
// STEP 11: INSERT BOOKINGS (Request/Approval System)
// ============================================================
print('\n📋 Creating Bookings...');

const bookingsResult = db.bookings.insertMany([
  // Approved booking by Lecturer 1
  {
    _id: ObjectId("693ad44526d23ee0a8bf0913"),
    roomId: ObjectId("693ad44526d23ee0a8bf090b"),  // G301
    requesterId: ObjectId("693ad44526d23ee0a8bf090a"),  // Trần Văn Giảng
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    bookingType: "teaching",  // teaching, meeting, self_study
    purpose: "Dạy PRN231",
    dateStart: new Date("2025-01-20"),
    dateEnd: new Date("2025-01-20"),
    slotType: "NEWSLOT",
    slotNumber: 3,
    timeSlotId: ObjectId("693ad44526d23ee0a8bf0900"),
    startTime: "13:00",
    endTime: "15:15",
    status: "approved",  // pending, approved, rejected, cancelled, completed
    approvedBy: ObjectId("693ad44526d23ee0a8bf091c"),  // Training Officer
    approvedAt: new Date("2025-01-10"),
    notes: "Đã duyệt",
    createdAt: new Date("2025-01-09"),
    updatedAt: new Date("2025-01-10")
  },
  // Pending booking by Student
  {
    _id: ObjectId("693ad44526d23ee0a8bf0914"),
    roomId: ObjectId("693ad44526d23ee0a8bf090c"),  // G302
    requesterId: ObjectId("693ad44526d23ee0a8bf091d"),  // Student
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    bookingType: "self_study",
    purpose: "Tự học nhóm môn SWP391",
    dateStart: new Date("2025-01-21"),
    dateEnd: new Date("2025-01-21"),
    slotType: "OLDSLOT",
    slotNumber: 5,
    timeSlotId: ObjectId("693ad44526d23ee0a8bf08fa"),
    startTime: "14:30",
    endTime: "16:00",
    status: "pending",
    notes: "",
    createdAt: new Date("2025-01-13"),
    updatedAt: new Date("2025-01-13")
  }
]);

print(`✅ Inserted ${Object.keys(bookingsResult.insertedIds).length} bookings`);

// ============================================================
// STEP 12: INSERT TRANSFERS (Key Handover System)
// ============================================================
print('\n🔄 Creating Transfers...');

const transfersResult = db.transfers.insertMany([
  // Transfer from Lecturer 1 to Lecturer 2 (Approved)
  {
    _id: ObjectId("693ad44526d23ee0a8bf0915"),
    roomId: ObjectId("693ad44526d23ee0a8bf090b"),  // G301
    lockerId: ObjectId("693ad44526d23ee0a8bf090d"),
    fromUserId: ObjectId("693ad44526d23ee0a8bf090a"),  // Trần Văn Giảng
    toUserId: ObjectId("693ad44526d23ee0a8bf091a"),  // Nguyễn Quang Sang
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    fromScheduleId: ObjectId("693ad44526d23ee0a8bf090f"),  // PRN231 SLOT 1
    toScheduleId: ObjectId("693ad44526d23ee0a8bf0910"),  // SWP391 SLOT 2
    transferDate: new Date("2025-01-13"),
    reason: "Dạy liên tiếp, không trả chìa về locker",
    status: "approved",  // pending, approved, rejected, cancelled, completed
    approvedAt: new Date("2025-01-13T09:16:00.000Z"),
    completedAt: new Date("2025-01-13T09:20:00.000Z"),
    notes: "Chuyển giao thành công",
    createdAt: new Date("2025-01-13T09:00:00.000Z"),
    updatedAt: new Date("2025-01-13T09:20:00.000Z")
  }
]);

print(`✅ Inserted ${Object.keys(transfersResult.insertedIds).length} transfers`);

// ============================================================
// STEP 13: INSERT INCIDENTS (Damage Reports)
// ============================================================
print('\n⚠️ Creating Incidents...');

const incidentsResult = db.incidents.insertMany([
  // Incident reported by Lecturer
  {
    _id: ObjectId("693ad44526d23ee0a8bf0916"),
    roomId: ObjectId("693ad44526d23ee0a8bf090b"),  // G301
    reporterId: ObjectId("693ad44526d23ee0a8bf090a"),  // Trần Văn Giảng
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    incidentType: "equipment_damage",  // equipment_damage, cleanliness, safety, other
    title: "Máy chiếu không hoạt động",
    description: "Máy chiếu trong phòng G301 không bật được, cần kiểm tra",
    severity: "medium",  // low, medium, high, critical
    status: "in_progress",  // reported, in_progress, resolved, closed
    priority: "high",
    assignedTo: ObjectId("693ad44526d23ee0a8bf091c"),  // Training Officer
    reportedAt: new Date("2025-01-13T08:00:00.000Z"),
    resolvedAt: null,
    resolvedBy: null,
    resolution: "",
    images: [],
    createdAt: new Date("2025-01-13T08:00:00.000Z"),
    updatedAt: new Date("2025-01-13T08:00:00.000Z")
  },
  // Incident reported by Security
  {
    _id: ObjectId("693ad44526d23ee0a8bf0917"),
    roomId: ObjectId("693ad44526d23ee0a8bf090c"),  // G302
    reporterId: ObjectId("693ad44526d23ee0a8bf091e"),  // Security
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    incidentType: "cleanliness",
    title: "Phòng chưa được vệ sinh",
    description: "Phòng G302 còn rác sau buổi học buổi sáng",
    severity: "low",
    status: "resolved",
    priority: "medium",
    assignedTo: null,
    reportedAt: new Date("2025-01-12T12:00:00.000Z"),
    resolvedAt: new Date("2025-01-12T14:00:00.000Z"),
    resolvedBy: ObjectId("693ad44526d23ee0a8bf091e"),
    resolution: "Đã vệ sinh lại phòng học",
    images: [],
    createdAt: new Date("2025-01-12T12:00:00.000Z"),
    updatedAt: new Date("2025-01-12T14:00:00.000Z")
  }
]);

print(`✅ Inserted ${Object.keys(incidentsResult.insertedIds).length} incidents`);

// ============================================================
// STEP 14: INSERT NOTIFICATIONS
// ============================================================
print('\n🔔 Creating Notifications...');

const notificationsResult = db.notifications.insertMany([
  // Notification for incident to Training Officer
  {
    _id: ObjectId("693ad44526d23ee0a8bf0918"),
    recipientId: ObjectId("693ad44526d23ee0a8bf091c"),  // Training Officer
    senderId: null,  // System generated
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    type: "incident_reported",  // incident_reported, booking_approved, booking_rejected, transfer_request, schedule_change, maintenance_alert
    title: "Báo cáo sự cố mới: Máy chiếu hỏng",
    message: "Giảng viên Trần Văn Giảng báo cáo máy chiếu phòng G301 không hoạt động",
    data: {
      incidentId: ObjectId("693ad44526d23ee0a8bf0916"),
      roomId: ObjectId("693ad44526d23ee0a8bf090b"),
      roomCode: "G301"
    },
    priority: "high",
    isRead: false,
    readAt: null,
    createdAt: new Date("2025-01-13T08:00:00.000Z"),
    updatedAt: new Date("2025-01-13T08:00:00.000Z")
  },
  // Notification for booking approval to Student
  {
    _id: ObjectId("693ad44526d23ee0a8bf0919"),
    recipientId: ObjectId("693ad44526d23ee0a8bf091d"),  // Student
    senderId: ObjectId("693ad44526d23ee0a8bf091c"),  // Training Officer
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    type: "booking_pending",
    title: "Yêu cầu đặt phòng đang chờ duyệt",
    message: "Yêu cầu đặt phòng G302 của bạn đang được xử lý",
    data: {
      bookingId: ObjectId("693ad44526d23ee0a8bf0914"),
      roomCode: "G302",
      date: "2025-01-21",
      slot: "OLDSLOT 5"
    },
    priority: "medium",
    isRead: false,
    readAt: null,
    createdAt: new Date("2025-01-13T10:00:00.000Z"),
    updatedAt: new Date("2025-01-13T10:00:00.000Z")
  }
]);

print(`✅ Inserted ${Object.keys(notificationsResult.insertedIds).length} notifications`);

// ============================================================
// STEP 15: INSERT ACCESS LOGS (IoT Security Logs)
// ============================================================
print('\n🔐 Creating Access Logs...');

const accessLogsResult = db.access_logs.insertMany([
  // Lecturer 1 unlocked room via IoT
  {
    _id: ObjectId("693ad44526d23ee0a8bf0920"),
    roomId: ObjectId("693ad44526d23ee0a8bf090b"),  // G301
    lockerId: ObjectId("693ad44526d23ee0a8bf090d"),
    userId: ObjectId("693ad44526d23ee0a8bf090a"),  // Trần Văn Giảng
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    scheduleId: ObjectId("693ad44526d23ee0a8bf090f"),
    action: "unlock",  // unlock, lock, access_denied, manual_override
    method: "face_recognition",  // face_recognition, fingerprint, rfid, mobile_app, manual
    success: true,
    accessTime: new Date("2025-01-13T07:00:00.000Z"),
    deviceId: "ESP32_G301_01",
    ipAddress: "192.168.1.100",
    location: "Tòa G - Tầng 3 - Phòng G301",
    reason: "Scheduled class PRN231",
    createdAt: new Date("2025-01-13T07:00:00.000Z")
  },
  // Lecturer 1 locked room after class
  {
    _id: ObjectId("693ad44526d23ee0a8bf0921"),
    roomId: ObjectId("693ad44426d23ee0a8bf090b"),
    lockerId: ObjectId("693ad44526d23ee0a8bf090d"),
    userId: ObjectId("693ad44526d23ee0a8bf090a"),
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    scheduleId: ObjectId("693ad44526d23ee0a8bf090f"),
    action: "lock",
    method: "mobile_app",
    success: true,
    accessTime: new Date("2025-01-13T09:15:00.000Z"),
    deviceId: "ESP32_G301_01",
    ipAddress: "192.168.1.100",
    location: "Tòa G - Tầng 3 - Phòng G301",
    reason: "End of class PRN231",
    createdAt: new Date("2025-01-13T09:15:00.000Z")
  },
  // Security patrol check
  {
    _id: ObjectId("693ad44526d23ee0a8bf0922"),
    roomId: ObjectId("693ad44526d23ee0a8bf090c"),  // G302
    lockerId: ObjectId("693ad44526d23ee0a8bf090e"),
    userId: ObjectId("693ad44526d23ee0a8bf091e"),  // Security
    campusId: ObjectId("693ad44426d23ee0a8bf08f5"),
    scheduleId: null,
    action: "unlock",
    method: "rfid",
    success: true,
    accessTime: new Date("2025-01-12T22:00:00.000Z"),
    deviceId: "ESP32_G302_01",
    ipAddress: "192.168.1.101",
    location: "Tòa G - Tầng 3 - Phòng G302",
    reason: "Security patrol",
    createdAt: new Date("2025-01-12T22:00:00.000Z")
  }
]);

print(`✅ Inserted ${Object.keys(accessLogsResult.insertedIds).length} access logs`);

// ============================================================
// STEP 16: CREATE INDEXES
// ============================================================
print('\n📊 Creating Indexes...');

// Roles indexes
db.roles.createIndex({ roleName: 1, campusId: 1 }, { unique: true });
db.roles.createIndex({ roleCode: 1, campusId: 1 });
db.roles.createIndex({ campusId: 1, isActive: 1 });
db.roles.createIndex({ roleLevel: 1 });

// Permissions indexes
db.permissions.createIndex({ permissionName: 1 }, { unique: true });
db.permissions.createIndex({ permissionCode: 1 }, { unique: true });
db.permissions.createIndex({ resource: 1, action: 1 });

// Role_Permissions indexes
db.role_permissions.createIndex({ roleId: 1, permissionId: 1 }, { unique: true });
db.role_permissions.createIndex({ roleId: 1, isActive: 1 });

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.users.createIndex({ roleId: 1, isActive: 1 });
db.users.createIndex({ campusId: 1 });
db.users.createIndex({ employeeId: 1 });

// Campus indexes
db.campus.createIndex({ campusCode: 1 }, { unique: true });
db.campus.createIndex({ isActive: 1 });

// Settings indexes
db.settings.createIndex({ key: 1, campusId: 1 }, { unique: true });
db.settings.createIndex({ campusId: 1 });

// Rooms indexes
db.rooms.createIndex({ roomCode: 1, campusId: 1 }, { unique: true });
db.rooms.createIndex({ campusId: 1, status: 1 });
db.rooms.createIndex({ building: 1, floor: 1 });

// Lockers indexes
db.lockers.createIndex({ lockerNumber: 1, campusId: 1 });
db.lockers.createIndex({ roomId: 1, status: 1 });
db.lockers.createIndex({ deviceId: 1 }, { unique: true });

// Schedules indexes
db.schedules.createIndex({ roomId: 1, dateStart: 1 });
db.schedules.createIndex({ lecturerId: 1 });
db.schedules.createIndex({ campusId: 1 });

// Time Slots indexes
db.time_slots.createIndex({ slotType: 1, slotNumber: 1 });

// Bookings indexes
db.bookings.createIndex({ roomId: 1, dateStart: 1, status: 1 });
db.bookings.createIndex({ requesterId: 1, status: 1 });
db.bookings.createIndex({ campusId: 1, status: 1 });
db.bookings.createIndex({ approvedBy: 1 });

// Transfers indexes
db.transfers.createIndex({ roomId: 1, transferDate: 1 });
db.transfers.createIndex({ fromUserId: 1, status: 1 });
db.transfers.createIndex({ toUserId: 1, status: 1 });
db.transfers.createIndex({ campusId: 1, status: 1 });

// Notifications indexes
db.notifications.createIndex({ recipientId: 1, isRead: 1 });
db.notifications.createIndex({ campusId: 1, createdAt: -1 });
db.notifications.createIndex({ type: 1 });

// Incidents indexes
db.incidents.createIndex({ roomId: 1, status: 1 });
db.incidents.createIndex({ reporterId: 1 });
db.incidents.createIndex({ assignedTo: 1, status: 1 });
db.incidents.createIndex({ campusId: 1, status: 1, severity: 1 });
db.incidents.createIndex({ reportedAt: -1 });

// Access Logs indexes
db.access_logs.createIndex({ roomId: 1, accessTime: -1 });
db.access_logs.createIndex({ userId: 1, accessTime: -1 });
db.access_logs.createIndex({ campusId: 1, accessTime: -1 });
db.access_logs.createIndex({ action: 1, success: 1 });
db.access_logs.createIndex({ deviceId: 1 });

print('✅ All indexes created');

// ============================================================
// SUMMARY
// ============================================================
print('\n\n════════════════════════════════════════════════════════');
print('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
print('════════════════════════════════════════════════════════\n');

print('📊 Collections Summary:');
print(`   - campus: ${db.campus.countDocuments()} documents`);
print(`   - roles: ${db.roles.countDocuments()} documents`);
print(`   - permissions: ${db.permissions.countDocuments()} documents`);
print(`   - role_permissions: ${db.role_permissions.countDocuments()} documents`);
print(`   - users: ${db.users.countDocuments()} documents`);
print(`   - time_slots: ${db.time_slots.countDocuments()} documents`);
print(`   - rooms: ${db.rooms.countDocuments()} documents`);
print(`   - lockers: ${db.lockers.countDocuments()} documents`);
print(`   - schedules: ${db.schedules.countDocuments()} documents`);
print(`   - bookings: ${db.bookings.countDocuments()} documents`);
print(`   - transfers: ${db.transfers.countDocuments()} documents`);
print(`   - notifications: ${db.notifications.countDocuments()} documents`);
print(`   - incidents: ${db.incidents.countDocuments()} documents`);
print(`   - access_logs: ${db.access_logs.countDocuments()} documents`);
print(`   - settings: ${db.settings.countDocuments()} documents`);

print('\n🏫 Campus:');
db.campus.find({}).forEach(campus => {
  print(`   - ${campus.campusName} (${campus.campusCode})`);
});

print('\n👔 Roles:');
db.roles.find({}).forEach(role => {
  const campusInfo = role.campusId ? `Campus: ${db.campus.findOne({_id: role.campusId})?.campusCode}` : 'Global';
  print(`   - ${role.roleName} (${role.roleCode}) - ${campusInfo} - Level: ${role.roleLevel}`);
});

print('\n👤 Users by Role:');
const roleGroups = db.users.aggregate([
  { $lookup: { from: "roles", localField: "roleId", foreignField: "_id", as: "roleInfo" } },
  { $unwind: "$roleInfo" },
  { $group: { _id: "$roleInfo.roleName", count: { $sum: 1 }, users: { $push: "$email" } } }
]).toArray();
roleGroups.forEach(group => {
  print(`   - ${group._id}: ${group.count} user(s)`);
  group.users.forEach(email => print(`      • ${email}`));
});

print('\n🏢 Rooms:');
db.rooms.find({}).forEach(room => {
  print(`   - ${room.roomCode}: ${room.roomName} (${room.capacity} seats)`);
});

print('\n� Schedules:');
db.schedules.find({}).forEach(schedule => {
  const room = db.rooms.findOne({ _id: schedule.roomId });
  const lecturer = db.users.findOne({ _id: schedule.lecturerId });
  print(`   - ${schedule.subjectCode} (${schedule.classCode}) - ${room?.roomCode} - ${schedule.slotType} ${schedule.slotNumber} - ${lecturer?.fullName}`);
});

print('\n�🔐 Lockers:');
db.lockers.find({}).forEach(locker => {
  print(`   - Locker ${locker.lockerNumber}: ${locker.position} (${locker.deviceId})`);
});

print('\n⏰ Time Slots:');
print(`   - ${db.time_slots.countDocuments({ slotType: "OLDSLOT" })} OLDSLOT time slots`);
print(`   - ${db.time_slots.countDocuments({ slotType: "NEWSLOT" })} NEWSLOT time slots`);

print('\n📋 Bookings:');
const bookingStats = db.bookings.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
]).toArray();
bookingStats.forEach(stat => print(`   - ${stat._id}: ${stat.count}`));

print('\n🔄 Transfers:');
print(`   - Total: ${db.transfers.countDocuments()}`);

print('\n⚠️ Incidents:');
const incidentStats = db.incidents.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
]).toArray();
incidentStats.forEach(stat => print(`   - ${stat._id}: ${stat.count}`));

print('\n🔔 Notifications:');
print(`   - Unread: ${db.notifications.countDocuments({ isRead: false })}`);
print(`   - Total: ${db.notifications.countDocuments()}`);

print('\n🔐 Access Logs:');
print(`   - Total entries: ${db.access_logs.countDocuments()}`);

print('\n⚙️ Settings:');
print(`   - ${db.settings.countDocuments({ campusId: null })} global settings`);
print(`   - ${db.settings.countDocuments({ campusId: { $ne: null } })} campus-specific settings`);

print('\n════════════════════════════════════════════════════════');
print('🎉 Database is ready to use!');
print('════════════════════════════════════════════════════════\n');
