import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer, CustomerGroup } from '../../models/customer.model';

@Component({
  selector: 'app-customer',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.html',
  styleUrl: './customer.scss'
})
export class CustomerComponent {
  private customerService = inject(CustomerService);
  
  customers = signal<Customer[]>([]);
  groups = signal<CustomerGroup[]>([]);
  selectedTab = signal<'customers' | 'groups' | 'loyalty'>('customers');
  searchQuery = signal('');
  
  newCustomer: Partial<Customer> = {};
  newGroup: Partial<CustomerGroup> = {};
  
  constructor() {
    this.loadCustomers();
    this.loadGroups();
  }
  
  loadCustomers() {
    this.customers.set(this.customerService.getCustomers());
  }
  
  loadGroups() {
    this.groups.set(this.customerService.getGroups());
  }
  
  addCustomer() {
    if (this.newCustomer.name) {
      this.customerService.addCustomer({
        name: this.newCustomer.name,
        email: this.newCustomer.email || '',
        phone: this.newCustomer.phone || '',
        address: this.newCustomer.address || '',
        city: this.newCustomer.city || '',
        state: this.newCustomer.state || '',
        zipCode: this.newCustomer.zipCode || '',
        loyaltyPoints: 0,
        totalSpent: 0,
        totalTransactions: 0
      });
      this.newCustomer = {};
      this.loadCustomers();
    }
  }
  
  addGroup() {
    if (this.newGroup.name && this.newGroup.discountPercentage !== undefined) {
      this.customerService.addGroup({
        name: this.newGroup.name,
        discountPercentage: this.newGroup.discountPercentage,
        description: this.newGroup.description || ''
      });
      this.newGroup = {};
      this.loadGroups();
    }
  }
  
  searchCustomers() {
    if (this.searchQuery()) {
      this.customers.set(this.customerService.searchCustomers(this.searchQuery()));
    } else {
      this.loadCustomers();
    }
  }
  
  getTotalCustomers() {
    return this.customers().length;
  }
  
  getTotalLoyaltyPoints() {
    return this.customers().reduce((sum, customer) => sum + customer.loyaltyPoints, 0);
  }
  
  getTotalRevenue() {
    return this.customers().reduce((sum, customer) => sum + customer.totalSpent, 0);
  }
  
  getAverageTransactionValue() {
    const totalTransactions = this.customers().reduce((sum, customer) => sum + customer.totalTransactions, 0);
    return totalTransactions > 0 ? this.getTotalRevenue() / totalTransactions : 0;
  }
}
