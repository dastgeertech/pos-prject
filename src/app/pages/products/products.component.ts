import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: any[] = [];
  searchQuery: string = '';
  showAddModal = false;
  editingProduct: Product | null = null;

  newProduct = {
    name: '',
    description: '',
    price: 0,
    cost: 0,
    quantity: 0,
    category: '',
    sku: '',
    taxable: true,
    active: true
  };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.products = this.productService.getProducts();
  }

  loadCategories() {
    this.categories = this.productService.getCategories();
  }

  filteredProducts() {
    if (!this.searchQuery) return this.products;
    return this.productService.searchProducts(this.searchQuery);
  }

  openAddModal() {
    this.editingProduct = null;
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      cost: 0,
      quantity: 0,
      category: '',
      sku: '',
      taxable: true,
      active: true
    };
    this.showAddModal = true;
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.newProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      category: product.category,
      sku: product.sku,
      taxable: product.taxable,
      active: product.active
    };
    this.showAddModal = true;
  }

  saveProduct() {
    if (!this.newProduct.name || !this.newProduct.sku) {
      alert('Please fill in required fields');
      return;
    }

    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, this.newProduct);
    } else {
      this.productService.addProduct(this.newProduct as any);
    }

    this.loadProducts();
    this.closeModal();
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id);
      this.loadProducts();
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.editingProduct = null;
  }

  getCategoryName(categoryId: string): string {
    return this.categories.find(c => c.id === categoryId)?.name || 'Unknown';
  }

  getProfit(product: Product): number {
    return product.price - product.cost;
  }

  getProfitMargin(product: Product): number {
    return ((product.price - product.cost) / product.price) * 100;
  }
}
