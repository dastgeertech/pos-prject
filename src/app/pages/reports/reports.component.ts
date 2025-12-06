import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  totalRevenue = 0;
  totalTransactions = 0;
  averageTransaction = 0;
  topProducts: any[] = [];
  topCustomers: any[] = [];
  revenueByCategory: any[] = [];

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    this.generateReports();
  }

  generateReports() {
    this.calculateRevenue();
    this.calculateTopProducts();
    this.calculateTopCustomers();
    this.calculateRevenueByCategory();
  }

  calculateRevenue() {
    const transactions = this.cartService.getTransactions();
    this.totalTransactions = transactions.length;
    this.totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    this.averageTransaction = this.totalTransactions > 0 ? this.totalRevenue / this.totalTransactions : 0;
  }

  calculateTopProducts() {
    const products = this.productService.getProducts();
    this.topProducts = products
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        sku: p.sku,
        revenue: p.price * p.quantity,
        quantity: p.quantity
      }));
  }

  calculateTopCustomers() {
    const customers = this.customerService.getCustomers();
    this.topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        totalSpent: c.totalSpent,
        transactions: c.totalTransactions,
        loyaltyPoints: c.loyaltyPoints
      }));
  }

  calculateRevenueByCategory() {
    const products = this.productService.getProducts();
    const categories = this.productService.getCategories();
    
    this.revenueByCategory = categories.map(cat => {
      const categoryProducts = products.filter(p => p.category === cat.id);
      const revenue = categoryProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      return {
        name: cat.name,
        revenue,
        productCount: categoryProducts.length
      };
    }).filter(c => c.revenue > 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }
}
