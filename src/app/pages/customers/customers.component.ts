import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  searchQuery: string = '';
  showAddModal = false;
  editingCustomer: Customer | null = null;

  newCustomer = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customers = this.customerService.getCustomers();
  }

  filteredCustomers() {
    if (!this.searchQuery) return this.customers;
    return this.customerService.searchCustomers(this.searchQuery);
  }

  openAddModal() {
    this.editingCustomer = null;
    this.newCustomer = {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    };
    this.showAddModal = true;
  }

  editCustomer(customer: Customer) {
    this.editingCustomer = customer;
    this.newCustomer = {
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || ''
    };
    this.showAddModal = true;
  }

  saveCustomer() {
    if (!this.newCustomer.name) {
      alert('Please enter customer name');
      return;
    }

    if (this.editingCustomer) {
      this.customerService.updateCustomer(this.editingCustomer.id, this.newCustomer as any);
    } else {
      this.customerService.addCustomer({
        ...this.newCustomer,
        loyaltyPoints: 0,
        totalSpent: 0,
        totalTransactions: 0
      } as any);
    }

    this.loadCustomers();
    this.closeModal();
  }

  deleteCustomer(id: string) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id);
      this.loadCustomers();
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.editingCustomer = null;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}
