# POS System - Setup & Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI 20.3.7
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Navigate to project directory**:
   ```bash
   cd pos-prject
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   ```
   http://localhost:4200
   ```

## Project Architecture

### Directory Structure
```
src/
├── app/
│   ├── models/              # Data models and interfaces
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   ├── customer.model.ts
│   │   └── user.model.ts
│   ├── services/            # Business logic and data management
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── customer.service.ts
│   │   └── auth.service.ts
│   ├── pages/               # Page components
│   │   ├── dashboard/       # Sales dashboard
│   │   ├── pos/            # Point of sale checkout
│   │   ├── products/       # Product management
│   │   ├── customers/      # Customer management
│   │   └── reports/        # Analytics and reports
│   ├── layout/              # Main layout with navigation
│   ├── utils/               # Helper functions
│   ├── app.routes.ts        # Route definitions
│   ├── app.config.ts        # App configuration
│   └── app.ts               # Root component
├── styles.scss              # Global styles with Tailwind
├── index.html               # HTML entry point
└── main.ts                  # Bootstrap file
```

## Available Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Dashboard | Home page with sales overview |
| `/dashboard` | Dashboard | Sales analytics and metrics |
| `/pos` | POS | Point of sale checkout interface |
| `/products` | Products | Product inventory management |
| `/customers` | Customers | Customer database management |
| `/reports` | Reports | Sales reports and analytics |

## Core Features

### 1. Dashboard
- Real-time sales metrics
- Transaction history
- Quick statistics cards
- Recent transactions table

### 2. Point of Sale (POS)
- Product catalog with search and filtering
- Shopping cart management
- Discount application
- Multiple payment methods
- Transaction completion

### 3. Product Management
- Add/edit/delete products
- Product categorization
- Inventory tracking
- Profit margin calculation
- Stock status monitoring

### 4. Customer Management
- Add/edit/delete customers
- Customer information storage
- Loyalty points tracking
- Purchase history
- Customer search

### 5. Reports & Analytics
- Revenue metrics
- Top products analysis
- Revenue by category
- Top customers list
- Transaction statistics

## Services Overview

### ProductService
Manages product catalog and categories.

**Key Methods**:
- `getProducts()` - Get all products
- `getProductById(id)` - Get single product
- `addProduct(product)` - Add new product
- `updateProduct(id, updates)` - Update product
- `deleteProduct(id)` - Delete product
- `searchProducts(query)` - Search products
- `getCategories()` - Get all categories

### CartService
Manages shopping cart and transactions.

**Key Methods**:
- `addItem(product, quantity)` - Add to cart
- `removeItem(itemId)` - Remove from cart
- `updateItemQuantity(itemId, quantity)` - Update quantity
- `applyDiscount(itemId, discount, type)` - Apply item discount
- `applyCartDiscount(discount, type)` - Apply cart-wide discount
- `completeTransaction(paymentMethod)` - Finalize sale
- `clearCart()` - Empty cart

### CustomerService
Manages customer database.

**Key Methods**:
- `getCustomers()` - Get all customers
- `getCustomerById(id)` - Get single customer
- `addCustomer(customer)` - Add new customer
- `updateCustomer(id, updates)` - Update customer
- `deleteCustomer(id)` - Delete customer
- `searchCustomers(query)` - Search customers
- `addLoyaltyPoints(customerId, points)` - Add loyalty points

### AuthService
Handles authentication and authorization.

**Key Methods**:
- `login(username, password)` - User login
- `logout()` - User logout
- `getCurrentUser()` - Get logged-in user
- `hasPermission(permission)` - Check permission
- `hasRole(role)` - Check user role

## Development Workflow

### Adding a New Feature

1. **Create Model** (if needed):
   ```typescript
   // src/app/models/feature.model.ts
   export interface Feature {
     id: string;
     name: string;
     // ... properties
   }
   ```

2. **Create Service**:
   ```typescript
   // src/app/services/feature.service.ts
   @Injectable({ providedIn: 'root' })
   export class FeatureService {
     // ... implementation
   }
   ```

3. **Create Component**:
   ```bash
   ng generate component pages/feature
   ```

4. **Add Route**:
   ```typescript
   // app.routes.ts
   { path: 'feature', component: FeatureComponent }
   ```

5. **Update Navigation**:
   ```html
   <!-- layout.component.html -->
   <a routerLink="/feature">Feature</a>
   ```

### Using Angular Signals

The project uses Angular Signals for reactive state management:

```typescript
// In service
private items = signal<Item[]>([]);
items$ = computed(() => this.items());

// In component
constructor(private service: ItemService) {}

items = this.service.items$;
```

## Styling with Tailwind CSS

All styling uses Tailwind CSS utility classes. Key classes:

- **Colors**: `bg-slate-900`, `text-white`, `border-slate-700`
- **Spacing**: `p-4`, `m-2`, `gap-3`
- **Flexbox**: `flex`, `items-center`, `justify-between`
- **Grid**: `grid`, `grid-cols-2`, `gap-4`
- **Responsive**: `md:`, `lg:`, `xl:` prefixes

## Mock Data

The application includes mock data for demonstration:

- **Products**: 4 sample products across different categories
- **Categories**: 4 product categories
- **Customers**: 2 sample customers
- **Cart**: Empty by default

Mock data is initialized in service constructors.

## Building for Production

```bash
npm run build
```

Output will be in `dist/pos-prject/`

## Testing

```bash
npm test
```

Runs unit tests using Karma and Jasmine.

## Troubleshooting

### Port Already in Use
```bash
ng serve --port 4201
```

### Module Not Found
```bash
npm install
```

### Build Errors
```bash
npm run build -- --configuration development
```

## Performance Tips

1. **Lazy Loading**: Routes can be lazy-loaded for better performance
2. **Change Detection**: Using `OnPush` strategy where possible
3. **Signals**: Using Angular Signals for efficient reactivity
4. **Tree Shaking**: Unused code is automatically removed in production

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## API Integration

To connect to a real backend:

1. Replace mock data in services with HTTP calls
2. Use `HttpClient` from `@angular/common/http`
3. Add interceptors for authentication
4. Handle errors appropriately

Example:
```typescript
constructor(private http: HttpClient) {}

getProducts() {
  return this.http.get<Product[]>('/api/products');
}
```

## Deployment

### Netlify
```bash
npm run build
# Deploy dist/pos-prject to Netlify
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 4200
CMD ["npm", "start"]
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT

## Support

For issues or questions, please refer to the README.md or Angular documentation.
