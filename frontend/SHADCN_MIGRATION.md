# Shadcn/UI Integration Guide

## ✅ Đã hoàn thành

### 1. Cấu hình cơ bản
- ✅ Installed shadcn/ui dependencies
- ✅ Created `components.json` config file
- ✅ Updated `tsconfig.json` with path aliases (`@/*`)
- ✅ Updated `tailwind.config.js` with shadcn theme
- ✅ Updated `src/index.css` with CSS variables
- ✅ Created `src/lib/utils.ts` with `cn()` helper
- ✅ Setup CRACO for webpack alias support
- ✅ Updated package.json scripts to use CRACO

### 2. Components đã cài đặt
- ✅ Button
- ✅ Card (với CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- ✅ Input
- ✅ Label
- ✅ Select
- ✅ Table
- ✅ Dialog
- ✅ Dropdown Menu
- ✅ Badge
- ✅ Avatar
- ✅ Separator
- ✅ Toast (với useToast hook)
- ✅ Alert

### 3. Components đã chuyển đổi
- ✅ `Button.tsx` - Wrapped shadcn Button
- ✅ `Card.tsx` - Wrapped shadcn Card với props tùy chỉnh
- ✅ `Avatar.tsx` - Wrapped shadcn Avatar
- ✅ `Loading.tsx` - Sử dụng Loader2 icon từ lucide-react
- ✅ `AdminLayout.tsx` - Updated với shadcn components

### 4. File mới được tạo
- ✅ `src/lib/utils.ts` - Utility function cn()
- ✅ `craco.config.js` - Webpack alias configuration
- ✅ `src/components/ShadcnExamples.tsx` - Component ví dụ
- ✅ Added Toaster to App.tsx

## 📚 Cách sử dụng

### Import components
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
```

### Button variants
```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Toast notifications
```tsx
const { toast } = useToast();

toast({
  title: "Success!",
  description: "Your changes have been saved.",
});

toast({
  variant: "destructive",
  title: "Error!",
  description: "Something went wrong.",
});
```

### Card với sections
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Table
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 🎨 Theme Customization

Chỉnh sửa colors trong `src/index.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --destructive: 0 84.2% 60.2%;
  /* ... more colors */
}
```

## 🚀 Chạy dự án

```bash
npm start
```

Server sẽ chạy trên http://localhost:3000

## 📝 Migration Guide

### Old Button → New Button
```tsx
// Old
<button className="bg-primary-600 hover:bg-primary-700">Click</button>

// New
<Button>Click</Button>
<Button variant="destructive">Delete</Button>
```

### Old Card → New Card
```tsx
// Old
<div className="bg-white rounded-lg shadow-md p-6">Content</div>

// New
<Card>
  <CardContent>Content</CardContent>
</Card>
```

### Old Colors → New Colors
```tsx
// Old
className="text-gray-600"
className="bg-primary-600"

// New
className="text-muted-foreground"
className="bg-primary"
```

## 🔗 Resources

- [Shadcn/UI Docs](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI Docs](https://www.radix-ui.com/)

## 📦 Thêm components mới

```bash
npx shadcn@latest add [component-name]
```

Ví dụ:
```bash
npx shadcn@latest add accordion
npx shadcn@latest add tabs
npx shadcn@latest add checkbox
```
