import { Product } from './product.model';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  subtotal: number;
  total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  customerId?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  cartId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'check' | 'digital';
  status: 'pending' | 'completed' | 'cancelled';
  reference?: string;
  timestamp: Date;
  cashier?: string;
  change?: number;
}
