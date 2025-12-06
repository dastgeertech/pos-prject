import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  totalSales = 0;
  transactions = 0;
  products = 0;
  customers = 0;
  recentTransactions: any[] = [];

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const allTransactions = this.cartService.getTransactions();
    this.totalSales = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    this.transactions = allTransactions.length;
    this.products = this.productService.getProducts().length;
    this.customers = this.customerService.getCustomers().length;
    this.recentTransactions = allTransactions.slice(-5).reverse();
  }
}
