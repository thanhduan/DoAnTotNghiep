# Auth Module - Usage Guide

## 🔐 Authentication Flow

### 1. **User chọn Campus và Login với Google**

```
Frontend Flow:
1. GET /api/campus → Lấy danh sách campus
2. User chọn campus
3. Redirect to: /api/auth/google/login?campusId=xxx
4. Google OAuth login
5. Callback: /api/auth/google/callback
6. Redirect về frontend với token
```

### 2. **API Endpoints**

#### **Public Endpoints**

```typescript
// Get list campuses
GET /api/campus
Response: {
  success: true,
  data: [
    {
      _id: "xxx",
      campusCode: "FUCT",
      campusName: "FPT University Can Tho",
      address: "..."
    }
  ]
}

// Initiate Google login
GET /api/auth/google/login?campusId=xxx
→ Redirects to Google OAuth

// Google callback (handled automatically)
GET /api/auth/google/callback
→ Redirects to frontend with token
```

#### **Protected Endpoints (Require JWT)**

```typescript
// Get user profile
GET /api/auth/profile
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: true,
  data: {
    _id: "xxx",
    email: "user@fpt.edu.vn",
    fullName: "...",
    role: "lecturer",
    campusId: { ... }
  }
}

// Check authentication
GET /api/auth/check
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: true,
  authenticated: true,
  user: { ... }
}

// Logout
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: true,
  message: "Logged out successfully"
}
```

---

## 🎯 Frontend Integration Example

### **React/Next.js Login Flow**

```typescript
// 1. Get campuses
const getCampuses = async () => {
  const res = await fetch('http://localhost:3000/api/campus');
  const data = await res.json();
  return data.data;
};

// 2. Login with selected campus
const loginWithGoogle = (campusId: string) => {
  window.location.href = `http://localhost:3000/api/auth/google/login?campusId=${campusId}`;
};

// 3. Handle callback (in /auth/callback page)
const handleCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const userStr = params.get('user');
  
  if (token) {
    // Save token
    localStorage.setItem('accessToken', token);
    
    // Save user info
    const user = JSON.parse(decodeURIComponent(userStr));
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
};

// 4. Make authenticated requests
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const res = await fetch('http://localhost:3000/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return res.json();
};
```

---

## 🛡️ Using Guards in Other Modules

### **Protect Routes with JWT**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/schemas/user.schema';

@Controller('schedules')
export class SchedulesController {
  
  @Get()
  @UseGuards(JwtAuthGuard)
  async getMySchedules(@CurrentUser() user: User) {
    // user is automatically injected
    return this.schedulesService.getByLecturer(user._id);
  }
}
```

### **Protect Routes with Roles**

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.TRAINING_STAFF)
  async getAllUsers() {
    // Only admin and training_staff can access
    return this.userService.findAll();
  }
  
  @Post('users')
  @Roles(UserRole.ADMIN)
  async createUser() {
    // Only admin can access
    return this.userService.create();
  }
}
```

---

## 📝 Environment Variables Required

Update your `.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3001
```

---

## 🔧 How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   https://yourdomain.com/api/auth/google/callback
   ```
7. Copy **Client ID** and **Client Secret** to `.env`

---

## 🧪 Testing with Postman

### 1. **Get Campuses**
```
GET http://localhost:3000/api/campus
```

### 2. **Login (use browser)**
```
Open: http://localhost:3000/api/auth/google/login?campusId=xxx
```

### 3. **Get Profile**
```
GET http://localhost:3000/api/auth/profile
Headers:
  Authorization: Bearer <your-token>
```

### 4. **Check Auth**
```
GET http://localhost:3000/api/auth/check
Headers:
  Authorization: Bearer <your-token>
```

---

## 🎨 Reusable Components Created

### **Guards**
- `JwtAuthGuard` - Protect routes (require login)
- `GoogleAuthGuard` - Handle Google OAuth
- `RolesGuard` - Check user roles

### **Decorators**
- `@CurrentUser()` - Get current user in controller
- `@Roles(...roles)` - Define required roles

### **Strategies**
- `GoogleStrategy` - Handle Google OAuth validation
- `JwtStrategy` - Handle JWT token validation

### **Services**
- `AuthService` - Reusable auth logic
- `CampusService` - Reusable campus logic

---

## 🚀 Next Steps

1. Update `.env` with Google OAuth credentials
2. Test login flow
3. Create protected routes in other modules
4. Add refresh token mechanism (optional)
5. Add Redis for token blacklist (optional)
