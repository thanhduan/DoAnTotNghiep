# Design System - Hệ thống Quản lý Phòng Học

## 🎨 Color Palette

### Primary Colors (Màu chính)
```
primary-50:  #eff6ff  - Background nhạt
primary-100: #dbeafe  - Hover states
primary-600: #2563eb  - Buttons, links chính
primary-700: #1d4ed8  - Hover buttons
```

### Semantic Colors (Màu ngữ nghĩa)
```
success: green-600  (#16a34a) - Thành công
warning: yellow-500 (#eab308) - Cảnh báo  
danger:  red-600    (#dc2626) - Lỗi, xóa
info:    blue-500   (#3b82f6) - Thông tin
```

### Neutral Colors (Màu trung tính)
```
gray-50:  #f9fafb - Background
gray-100: #f3f4f6 - Card background
gray-200: #e5e7eb - Borders
gray-500: #6b7280 - Text phụ
gray-900: #111827 - Text chính
```

---

## 📏 Spacing & Sizing

### Spacing Scale (theo Tailwind)
```
xs: 0.25rem (1)    - Khoảng cách rất nhỏ
sm: 0.5rem  (2)    - Khoảng cách nhỏ
md: 1rem    (4)    - Khoảng cách trung bình
lg: 1.5rem  (6)    - Khoảng cách lớn
xl: 2rem    (8)    - Khoảng cách rất lớn
```

### Component Sizes
- **Button heights**: sm (36px), md (40px), lg (48px)
- **Input heights**: md (40px), lg (48px)
- **Border radius**: rounded-lg (0.5rem) - mặc định cho tất cả components

---

## ✏️ Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Font Sizes
```
text-xs:   0.75rem  (12px) - Labels nhỏ
text-sm:   0.875rem (14px) - Body text phụ
text-base: 1rem     (16px) - Body text chính
text-lg:   1.125rem (18px) - Headings nhỏ
text-xl:   1.25rem  (20px) - Headings
text-2xl:  1.5rem   (24px) - Page titles
text-3xl:  1.875rem (30px) - Hero titles
```

### Font Weights
```
font-normal:  400 - Body text
font-medium:  500 - Emphasis
font-semibold: 600 - Headings
font-bold:    700 - Strong emphasis
```

---

## 🧩 Component Guidelines

### Button
**Variants:**
- `primary`: Hành động chính (Lưu, Xác nhận, Đăng nhập)
- `secondary`: Hành động phụ (Hủy, Quay lại)
- `danger`: Hành động nguy hiểm (Xóa, Khóa)
- `success`: Hành động tích cực (Duyệt, Kích hoạt)

**Sizes:**
- `sm`: Trong table, compact UI
- `md`: Mặc định
- `lg`: Hero sections, CTAs lớn

**Usage:**
```tsx
<Button variant="primary" size="md">Đăng nhập</Button>
<Button variant="danger" size="sm">Xóa</Button>
```

### Card
```tsx
<Card>
  <Card.Header>Tiêu đề</Card.Header>
  <Card.Body>Nội dung</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```
- **Background**: bg-white
- **Border**: border border-gray-200
- **Shadow**: shadow-sm (hover: shadow-md)
- **Padding**: p-6 (header/body), p-4 (footer)

### Input/Form Fields
- **Height**: 40px (md), 48px (lg)
- **Border**: border-gray-300, focus:border-primary-500
- **Focus ring**: focus:ring-2 focus:ring-primary-500
- **Padding**: px-4 py-2

### Modal/Dialog
- **Overlay**: bg-black/50
- **Container**: bg-white rounded-lg shadow-xl
- **Max width**: max-w-md (small), max-w-2xl (large)
- **Padding**: p-6

---

## 📐 Layout Patterns

### Page Layout
```tsx
<MainLayout>
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-2xl font-semibold text-gray-900 mb-6">
      Tiêu đề trang
    </h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Content cards */}
    </div>
  </div>
</MainLayout>
```

### Grid System
- **Container**: `container mx-auto px-4`
- **Responsive grids**: 
  - Mobile: `grid-cols-1`
  - Tablet: `md:grid-cols-2`
  - Desktop: `lg:grid-cols-3` hoặc `lg:grid-cols-4`
- **Gap**: `gap-4` (medium), `gap-6` (large)

---

## 🎯 Responsive Breakpoints

```
sm:  640px  - Mobile landscape
md:  768px  - Tablet
lg:  1024px - Desktop
xl:  1280px - Large desktop
2xl: 1536px - Extra large
```

**Mobile-first approach:**
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

---

## ⚠️ States & Feedback

### Loading States
```tsx
<Button isLoading>Đang xử lý...</Button>
<Loading /> // Spinner component
```

### Error States
- **Input error**: border-red-500, text-red-600 cho message
- **Toast notification**: Dùng position fixed top-right

### Empty States
```tsx
<div className="text-center py-12">
  <p className="text-gray-500">Chưa có dữ liệu</p>
</div>
```

### Hover/Focus
- **Buttons**: opacity hoặc màu đậm hơn
- **Cards**: shadow-sm → shadow-md
- **Links**: text-primary-600 hover:text-primary-700 underline

---

## ✅ Accessibility

- Luôn có `aria-label` cho icon buttons
- Focus states rõ ràng (ring-2)
- Color contrast đạt WCAG AA (4.5:1)
- Keyboard navigation hoạt động tốt

---

## 📱 Component Examples

### Page Header
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-semibold text-gray-900">
    Danh sách phòng học
  </h1>
  <Button variant="primary">
    Thêm phòng mới
  </Button>
</div>
```

### Data Table
- **Header**: bg-gray-50, font-semibold, text-sm
- **Rows**: border-b border-gray-200
- **Hover**: bg-gray-50
- **Padding**: px-6 py-4

### Form Layout
```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Tên phòng
    </label>
    <input className="w-full px-4 py-2 border border-gray-300 rounded-lg..." />
  </div>
</form>
```

---

## 🚫 DON'Ts

❌ Không dùng màu ngẫu nhiên ngoài palette
❌ Không dùng spacing tùy ý (dùng scale: 2, 4, 6, 8...)
❌ Không inline styles trừ khi thật sự cần thiết
❌ Không dùng `!important` trong CSS
❌ Không hardcode dimensions - dùng responsive classes

---

## ✅ DO's

✅ Dùng Tailwind utility classes
✅ Component tái sử dụng trong `components/common/`
✅ Consistent spacing và sizing
✅ Mobile-first design
✅ Accessibility-first approach
