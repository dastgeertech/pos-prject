import { Injectable, signal, computed } from '@angular/core';
import { Product, ProductCategory } from '../models/product.model';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>([]);
  private categories = signal<ProductCategory[]>([]);

  products$ = computed(() => this.products());
  categories$ = computed(() => this.categories());

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockCategories: ProductCategory[] = [
      { id: uuid(), name: 'Electronics', icon: 'Zap' },
      { id: uuid(), name: 'Clothing', icon: 'Shirt' },
      { id: uuid(), name: 'Food & Beverage', icon: 'Coffee' },
      { id: uuid(), name: 'Books', icon: 'Book' }
    ];

    this.categories.set(mockCategories);

    const mockProducts: Product[] = [
      {
        id: uuid(),
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 999.99,
        cost: 600,
        quantity: 10,
        category: mockCategories[0].id,
        sku: 'LAPTOP-001',
        taxable: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 29.99,
        cost: 15,
        quantity: 50,
        category: mockCategories[0].id,
        sku: 'MOUSE-001',
        taxable: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'T-Shirt',
        description: 'Cotton t-shirt',
        price: 19.99,
        cost: 8,
        quantity: 100,
        category: mockCategories[1].id,
        sku: 'TSHIRT-001',
        taxable: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'Coffee',
        description: 'Premium coffee beans',
        price: 12.99,
        cost: 5,
        quantity: 200,
        category: mockCategories[2].id,
        sku: 'COFFEE-001',
        taxable: false,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.products.set(mockProducts);
  }

  getProducts(): Product[] {
    return this.products();
  }

  getProductById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  getProductsByCategory(categoryId: string): Product[] {
    return this.products().filter(p => p.category === categoryId);
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.update(products => [...products, newProduct]);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const product = this.getProductById(id);
    if (!product) return undefined;

    const updated = { ...product, ...updates, updatedAt: new Date() };
    this.products.update(products =>
      products.map(p => p.id === id ? updated : p)
    );
    return updated;
  }

  deleteProduct(id: string): boolean {
    const initial = this.products().length;
    this.products.update(products => products.filter(p => p.id !== id));
    return this.products().length < initial;
  }

  getCategories(): ProductCategory[] {
    return this.categories();
  }

  addCategory(category: Omit<ProductCategory, 'id'>): ProductCategory {
    const newCategory: ProductCategory = {
      ...category,
      id: uuid()
    };
    this.categories.update(cats => [...cats, newCategory]);
    return newCategory;
  }

  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }
}
