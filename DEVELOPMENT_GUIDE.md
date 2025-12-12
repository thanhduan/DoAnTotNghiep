# Development Guide - Hướng dẫn Phát triển

## 🚀 Setup môi trường lần đầu

### 1. Cài đặt Prerequisites
```bash
# Node.js version 18 hoặc cao hơn
node --version  # >= 18.0.0

# npm hoặc yarn
npm --version   # >= 9.0.0
```

### 2. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd DoAnTotNghiep

# Backend setup
cd backendAPI
npm install
cp .env.example .env
# ⚠️ Chỉnh sửa .env với thông tin database và OAuth

# Frontend setup
cd ../frontend
npm install
```

### 3. Environment Variables

**Backend (.env):**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/classroom-management

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (cho CORS)
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Chạy ứng dụng

```bash
# Terminal 1 - Backend
cd backendAPI
npm run start:dev  # Chạy trên port 3001

# Terminal 2 - Frontend  
cd frontend
npm start          # Chạy trên port 3000
```

Truy cập: http://localhost:3000

---

## 📁 Cấu trúc Dự án

### Backend (NestJS)
```
backendAPI/src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication & Authorization
│   ├── users/        # User management
│   ├── campus/       # Campus management
│   └── [feature]/    # Các module khác
├── common/           # Shared resources
│   ├── decorators/   # Custom decorators (@CurrentUser, @Roles)
│   ├── guards/       # Auth guards
│   ├── interceptors/ # Response transform, logging
│   ├── filters/      # Exception handling
│   └── dto/          # Common DTOs
├── database/         # Database schemas
│   └── schemas/      # Mongoose schemas
└── config/           # Configuration files
```

### Frontend (React)
```
frontend/src/
├── pages/            # Page components (routing)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── Admin/
├── components/       # Reusable components
│   ├── common/       # Button, Card, Loading, Input...
│   └── features/     # Feature-specific components
├── layouts/          # Layout wrappers
├── services/         # API calls
├── context/          # React Context (AuthContext)
├── hooks/            # Custom hooks
├── types/            # TypeScript types
├── utils/            # Helper functions
└── constants/        # Constants, enums
```

---

## 🔄 Git Workflow

### Branch Naming Convention
```
feature/ten-tinh-nang       # Tính năng mới
bugfix/mo-ta-loi            # Sửa lỗi
hotfix/sua-gap              # Sửa lỗi khẩn cấp
refactor/cai-tien           # Refactor code
docs/cap-nhat-tai-lieu      # Cập nhật document
```

### Commit Message Convention
```bash
# Format: <type>: <description>

# Types:
feat:     Tính năng mới
fix:      Sửa lỗi
refactor: Refactor code (không thay đổi chức năng)
style:    Format code, thêm dấu chấm phẩy...
docs:     Cập nhật document
test:     Thêm/sửa tests
chore:    Build tasks, package manager configs

# Examples:
git commit -m "feat: thêm chức năng đặt phòng học"
git commit -m "fix: sửa lỗi đăng nhập bằng Google"
git commit -m "refactor: tối ưu hóa BookingService"
git commit -m "docs: cập nhật API documentation"
```

### Pull Request Workflow
```bash
# 1. Tạo branch mới từ main
git checkout main
git pull origin main
git checkout -b feature/dat-phong

# 2. Code và commit
git add .
git commit -m "feat: thêm form đặt phòng"

# 3. Push lên remote
git push origin feature/dat-phong

# 4. Tạo Pull Request trên GitHub
# - Thêm description chi tiết
# - Assign reviewer
# - Link issue nếu có

# 5. Sau khi được approve, merge vào main
# 6. Delete branch sau khi merge
```

---

## 🛠️ Development Workflow

### 1. Tạo Feature Mới (Backend)

```bash
# Tạo module mới
cd backendAPI
nest g module modules/bookings
nest g controller modules/bookings
nest g service modules/bookings
```

**Checklist:**
- [ ] Tạo DTO trong `dto/` folder
- [ ] Tạo Schema trong `database/schemas/`
- [ ] Implement service với business logic
- [ ] Implement controller với endpoints
- [ ] Thêm validation (class-validator)
- [ ] Thêm guards cho authentication
- [ ] Test endpoints với Postman/Thunder Client

**Example structure:**
```
modules/bookings/
├── dto/
│   ├── create-booking.dto.ts
│   ├── update-booking.dto.ts
│   └── booking-response.dto.ts
├── bookings.controller.ts
├── bookings.service.ts
└── bookings.module.ts
```

### 2. Tạo Feature Mới (Frontend)

**Checklist:**
- [ ] Tạo page component trong `pages/`
- [ ] Tạo reusable components trong `components/features/`
- [ ] Tạo service functions trong `services/`
- [ ] Tạo types trong `types/`
- [ ] Thêm route trong `routes/index.tsx`
- [ ] Test UI trên nhiều screen sizes

**Example:**
```typescript
// 1. Create type (types/booking.types.ts)
export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
}

// 2. Create service (services/booking.service.ts)
export const bookingService = {
  getAll: () => api.get<Booking[]>('/bookings'),
  create: (data: CreateBookingDto) => api.post('/bookings', data),
};

// 3. Create page (pages/BookingPage.tsx)
const BookingPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  // ...implementation
};
```

### 3. Code Review Checklist

**Backend:**
- [ ] DTOs có validation đầy đủ
- [ ] Endpoints có guards (JwtAuthGuard, RolesGuard)
- [ ] Error handling đúng chuẩn
- [ ] Service có return type rõ ràng
- [ ] MongoDB queries được optimize
- [ ] Không có hardcoded values

**Frontend:**
- [ ] Components có TypeScript types đầy đủ
- [ ] Không có `any` type
- [ ] Loading và error states được xử lý
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Follow Design System (DESIGN_SYSTEM.md)
- [ ] Accessibility (aria-labels, keyboard navigation)

---

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ DO: Explicit types
interface UserProps {
  name: string;
  email: string;
  role: UserRole;
}

const UserCard: React.FC<UserProps> = ({ name, email, role }) => {
  // ...
};

// ❌ DON'T: Any types
const UserCard = (props: any) => {
  // ...
};
```

### React Components

```typescript
// ✅ DO: Functional components with hooks
import React, { useState, useEffect } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  onClick, 
  children 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;

// ❌ DON'T: Class components
class Button extends React.Component {
  // ...
}
```

### API Service Pattern

```typescript
// services/booking.service.ts
import { api } from './api.service';
import { Booking, CreateBookingDto } from '../types';

export const bookingService = {
  // Get all bookings
  getAll: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  // Create booking
  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  // Update booking
  update: async (id: string, data: Partial<CreateBookingDto>): Promise<Booking> => {
    const response = await api.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  // Delete booking
  delete: async (id: string): Promise<void> => {
    await api.delete(`/bookings/${id}`);
  },
};
```

### NestJS Service Pattern

```typescript
// bookings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<Booking>,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().populate('user room').exec();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('user room')
      .exec();
    
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found`);
    }
    
    return booking;
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = new this.bookingModel(createBookingDto);
    return booking.save();
  }
}
```

---

## 🧪 Testing

### Backend Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Testing
```bash
# Run tests
npm test

# Coverage
npm test -- --coverage
```

---

## 🐛 Debugging

### Backend
```bash
# Debug mode
npm run start:debug

# VS Code: Attach to port 9229
```

### Frontend
- React DevTools extension
- Redux DevTools (nếu dùng Redux)
- Console.log (development only)

---

## 📦 Build & Deployment

### Backend
```bash
npm run build
npm run start:prod
```

### Frontend
```bash
npm run build
# Output: build/ folder
```

---

## ⚠️ Common Issues & Solutions

### Issue: MongoDB connection failed
```bash
# Check MongoDB is running
# Windows: Services -> MongoDB
# Ubuntu: sudo systemctl status mongodb
```

### Issue: Port already in use
```bash
# Kill process on port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux:
sudo lsof -i :3001
sudo kill -9 <PID>
```

### Issue: Google OAuth not working
- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
- Kiểm tra Authorized redirect URIs trong Google Console
- Đảm bảo callback URL đúng: `http://localhost:3001/api/auth/google/callback`

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

---

## 👥 Team Communication

### Daily Standup
- Hôm qua làm gì?
- Hôm nay làm gì?
- Có vấn đề gì cần hỗ trợ?

### Code Review Etiquette
- Review code trong vòng 24h
- Comment mang tính xây dựng
- Giải thích lý do khi request changes
- Approve nếu code đạt chuẩn

### Issue Tracking
- Tạo issue trước khi code
- Label rõ ràng: bug, feature, enhancement
- Assign người phụ trách
- Update tiến độ thường xuyên
