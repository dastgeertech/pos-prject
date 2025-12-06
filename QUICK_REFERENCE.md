# POS System - Quick Reference Guide

## 🚀 Quick Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch mode
npm run watch
```

## 📍 Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/dashboard` | Sales overview |
| POS | `/pos` | Checkout |
| Products | `/products` | Inventory |
| Customers | `/customers` | Customer DB |
| Reports | `/reports` | Analytics |

## 🎯 Common Tasks

### Add a Product
1. Navigate to `/products`
2. Click "+ Add Product"
3. Fill in product details
4. Click "Save Product"

### Process a Sale
1. Navigate to `/pos`
2. Search or browse products
3. Click product to add to cart
4. Adjust quantity if needed
5. Click "Complete Sale"
6. Select payment method
7. Confirm payment

### Add a Customer
1. Navigate to `/customers`
2. Click "+ Add Customer"
3. Enter customer information
4. Click "Save Customer"

### View Reports
1. Navigate to `/reports`
2. View key metrics at top
3. Scroll for detailed analytics
4. Check top products and customers

## 📂 File Locations

```
Models:        src/app/models/
Services:      src/app/services/
Components:    src/app/pages/
Layout:        src/app/layout/
Utils:         src/app/utils/
Styles:        src/styles.scss
Routes:        src/app/app.routes.ts
```

## 🔑 Key Classes & Interfaces

### Product
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  category: string;
  sku: string;
  taxable: boolean;
  active: boolean;
}
```

### CartItem
```typescript
interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}
```

### Customer
```typescript
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalTransactions: number;
}
```

## 🎨 Tailwind Classes Used

### Colors
- `bg-slate-900` - Dark background
- `bg-slate-800` - Card background
- `text-white` - Main text
- `text-slate-400` - Secondary text
- `bg-blue-600` - Primary action
- `bg-green-500` - Success
- `bg-red-500` - Danger

### Spacing
- `p-4` - Padding
- `m-2` - Margin
- `gap-4` - Gap between items
- `mb-8` - Margin bottom

### Layout
- `flex` - Flexbox
- `grid` - Grid layout
- `items-center` - Vertical center
- `justify-between` - Space between

## 🔧 Service Usage

### In Component
```typescript
constructor(private productService: ProductService) {}

ngOnInit() {
  this.products = this.productService.getProducts();
}
```

### Add Item to Cart
```typescript
this.cartService.addItem(product, quantity);
```

### Get Cart Total
```typescript
const total = this.cartService.getCartTotal();
```

### Search Products
```typescript
const results = this.productService.searchProducts(query);
```

## 🎯 Component Structure

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss'
})
export class FeatureComponent implements OnInit {
  // Properties
  data: any[] = [];
  
  // Constructor
  constructor(private service: FeatureService) {}
  
  // Lifecycle
  ngOnInit() {
    this.loadData();
  }
  
  // Methods
  loadData() {
    this.data = this.service.getData();
  }
}
```

## 📊 Data Flow

```
User Action
    ↓
Component Method
    ↓
Service Method
    ↓
Signal Update
    ↓
Template Re-render
```

## 🎨 Styling Pattern

```html
<!-- Container -->
<div class="p-8 bg-slate-900 min-h-screen">
  <!-- Header -->
  <h1 class="text-3xl font-bold text-white mb-8">Title</h1>
  
  <!-- Content -->
  <div class="bg-slate-800 rounded-lg p-6 shadow-lg">
    <!-- Items -->
  </div>
</div>
```

## 🔄 Common Patterns

### Search Filter
```typescript
filteredItems() {
  if (!this.query) return this.items;
  return this.service.search(this.query);
}
```

### Modal Dialog
```html
<div *ngIf="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-slate-800 rounded-lg p-8 w-full max-w-2xl">
    <!-- Modal content -->
  </div>
</div>
```

### Table
```html
<table class="w-full text-white text-sm">
  <thead class="bg-slate-700 border-b border-slate-600">
    <tr>
      <th class="text-left py-4 px-6">Column</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let item of items" class="border-b border-slate-700 hover:bg-slate-700">
      <td class="py-4 px-6">{{ item.name }}</td>
    </tr>
  </tbody>
</table>
```

## 🔐 Authentication

### Login
```typescript
const response = this.authService.login(username, password);
```

### Check Permission
```typescript
if (this.authService.hasPermission('write')) {
  // Allow action
}
```

### Check Role
```typescript
if (this.authService.hasRole('admin')) {
  // Show admin features
}
```

## 💾 Local Storage

```typescript
// Save
localStorage.setItem('key', JSON.stringify(data));

// Load
const data = JSON.parse(localStorage.getItem('key') || '{}');

// Remove
localStorage.removeItem('key');
```

## 🐛 Debugging

### Console Logging
```typescript
console.log('Value:', value);
console.error('Error:', error);
console.warn('Warning:', warning);
```

### Angular DevTools
- Install Angular DevTools browser extension
- Open DevTools → Angular tab
- Inspect components and signals

### Network Tab
- Check API calls in Network tab
- Verify request/response data

## 📱 Responsive Breakpoints

```
Mobile:  < 768px
Tablet:  768px - 1024px
Desktop: > 1024px
```

### Tailwind Prefixes
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up

## ⚡ Performance Tips

1. Use `OnPush` change detection
2. Unsubscribe from observables
3. Lazy load routes
4. Use trackBy in *ngFor
5. Minimize bundle size
6. Cache API responses

## 🎓 Learning Path

1. Understand the project structure
2. Review service implementations
3. Study component templates
4. Learn Tailwind classes
5. Explore routing
6. Practice adding features

## 🆘 Troubleshooting

### Port 4200 in use
```bash
ng serve --port 4201
```

### Module not found
```bash
npm install
```

### Build errors
```bash
npm run build -- --configuration development
```

### Clear cache
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Quick Links

- [Angular Docs](https://angular.io)
- [Tailwind Docs](https://tailwindcss.com)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Project README](./README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Project Summary](./PROJECT_SUMMARY.md)

---

**Pro Tip**: Bookmark this page for quick reference during development!
