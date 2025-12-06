export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  quantity: number;
  category: string;
  sku: string;
  barcode?: string;
  taxable: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}
