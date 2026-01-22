/**
 * MIGRATION CHECKLIST - Chuyển đổi UI components sang Shadcn/UI
 * 
 * Các file cần update để sử dụng shadcn/ui components thống nhất
 */

export const MIGRATION_CHECKLIST = {
  // ✅ Đã hoàn thành
  completed: [
    'src/components/common/Button.tsx',
    'src/components/common/Card.tsx', 
    'src/components/common/Avatar.tsx',
    'src/components/common/Loading.tsx',
    'src/layouts/AdminLayout.tsx',
    'src/App.tsx', // Added Toaster
  ],

  // 🔄 Cần update
  pending: {
    layouts: [
      'src/layouts/CommonUserLayout.tsx', // Update với shadcn components
    ],
    
    pages: [
      'src/pages/LoginPage.tsx', // Update form với shadcn Input, Button
      'src/pages/Admin/DashboardPage.tsx', // Update Cards, Stats
      'src/pages/Admin/UserManagementPage.tsx', // Update Table, Dialog
      'src/pages/Admin/RoleManagementPage.tsx', // Update Table, Badge
    ],
    
    features: [
      'src/components/Roles/CreateRoleModal.tsx', // Convert to Dialog component
    ],
  },
};

/**
 * QUICK REFERENCE - Shadcn/UI Components
 */

export const COMPONENT_MAPPING = {
  // Buttons
  button: {
    old: '<button className="bg-blue-600 hover:bg-blue-700">Click</button>',
    new: '<Button>Click</Button>',
    variants: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    sizes: ['default', 'sm', 'lg', 'icon'],
  },

  // Cards
  card: {
    old: '<div className="bg-white rounded-lg shadow p-4">Content</div>',
    new: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
  },

  // Input
  input: {
    old: '<input className="border rounded px-3 py-2" />',
    new: '<Input placeholder="Enter text..." />',
    withLabel: `<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>`,
  },

  // Select
  select: {
    old: '<select className="border rounded px-3 py-2"><option>...</option></select>',
    new: `<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>`,
  },

  // Table
  table: {
    old: '<table className="min-w-full"><thead>...</thead><tbody>...</tbody></table>',
    new: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  },

  // Dialog/Modal
  dialog: {
    old: 'Custom modal implementation',
    new: `<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  },

  // Badge
  badge: {
    old: '<span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>',
    new: '<Badge variant="secondary">Active</Badge>',
    variants: ['default', 'secondary', 'destructive', 'outline'],
  },

  // Avatar
  avatar: {
    old: '<img src="..." className="w-10 h-10 rounded-full" />',
    new: `<Avatar>
  <AvatarImage src="..." alt="..." />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>`,
  },

  // Dropdown Menu
  dropdownMenu: {
    new: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
  },

  // Toast
  toast: {
    usage: `const { toast } = useToast();

toast({
  title: "Success",
  description: "Operation completed",
});

toast({
  variant: "destructive",
  title: "Error",
  description: "Something went wrong",
});`,
  },

  // Alert
  alert: {
    new: `<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>Message here</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Error message</AlertDescription>
</Alert>`,
  },
};

/**
 * COLOR MIGRATION - Tailwind to Shadcn
 */

export const COLOR_MAPPING = {
  background: {
    old: ['bg-white', 'bg-gray-100', 'bg-gray-50'],
    new: 'bg-background',
  },
  
  foreground: {
    old: ['text-gray-900', 'text-black'],
    new: 'text-foreground',
  },

  card: {
    old: ['bg-white border border-gray-200'],
    new: 'bg-card text-card-foreground',
  },

  primary: {
    old: ['bg-blue-600', 'text-blue-600', 'bg-primary-600'],
    new: 'bg-primary text-primary-foreground',
  },

  muted: {
    old: ['text-gray-500', 'text-gray-600', 'bg-gray-100'],
    new: 'text-muted-foreground bg-muted',
  },

  border: {
    old: ['border-gray-200', 'border-gray-300'],
    new: 'border',
  },

  destructive: {
    old: ['bg-red-600', 'text-red-600'],
    new: 'bg-destructive text-destructive-foreground',
  },
};

/**
 * ICON MIGRATION - SVG to Lucide React
 */

export const ICON_EXAMPLES = {
  import: "import { Plus, Search, Edit, Trash2, MoreHorizontal, Check, X } from 'lucide-react';",
  
  usage: {
    button: '<Button><Plus className="mr-2 h-4 w-4" />Add New</Button>',
    icon: '<Search className="h-5 w-5 text-muted-foreground" />',
    animated: '<Loader2 className="h-4 w-4 animate-spin" />',
  },

  commonIcons: [
    'Plus', 'Search', 'Edit', 'Trash2', 'MoreHorizontal',
    'Check', 'X', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
    'AlertCircle', 'CheckCircle2', 'Info', 'AlertTriangle',
    'User', 'Users', 'Mail', 'Phone', 'MapPin',
    'Calendar', 'Clock', 'Bell', 'Settings', 'LogOut',
    'Home', 'Building', 'BookOpen', 'FileText', 'Folder',
    'Download', 'Upload', 'Save', 'Copy', 'Share2',
  ],
};

/**
 * FORM PATTERN - Recommended structure
 */

export const FORM_PATTERN = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export function MyForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toast({
      title: 'Success',
      description: 'Form submitted successfully',
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Enter name..."
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
`;
