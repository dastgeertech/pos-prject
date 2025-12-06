import { Injectable, signal, computed } from '@angular/core';
import { Customer, CustomerGroup } from '../models/customer.model';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customers = signal<Customer[]>([]);
  private groups = signal<CustomerGroup[]>([]);

  customers$ = computed(() => this.customers());
  groups$ = computed(() => this.groups());

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockGroups: CustomerGroup[] = [
      { id: uuid(), name: 'Regular', discountPercentage: 0 },
      { id: uuid(), name: 'VIP', discountPercentage: 10 },
      { id: uuid(), name: 'Wholesale', discountPercentage: 20 }
    ];

    this.groups.set(mockGroups);

    const mockCustomers: Customer[] = [
      {
        id: uuid(),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0001',
        loyaltyPoints: 150,
        totalSpent: 1500,
        totalTransactions: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-0002',
        loyaltyPoints: 300,
        totalSpent: 3000,
        totalTransactions: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.customers.set(mockCustomers);
  }

  getCustomers(): Customer[] {
    return this.customers();
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers().find(c => c.id === id);
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.update(customers => [...customers, newCustomer]);
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const customer = this.getCustomerById(id);
    if (!customer) return undefined;

    const updated = { ...customer, ...updates, updatedAt: new Date() };
    this.customers.update(customers =>
      customers.map(c => c.id === id ? updated : c)
    );
    return updated;
  }

  deleteCustomer(id: string): boolean {
    const initial = this.customers().length;
    this.customers.update(customers => customers.filter(c => c.id !== id));
    return this.customers().length < initial;
  }

  searchCustomers(query: string): Customer[] {
    const lowerQuery = query.toLowerCase();
    return this.customers().filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.phone?.includes(query)
    );
  }

  addLoyaltyPoints(customerId: string, points: number): void {
    this.updateCustomer(customerId, {
      loyaltyPoints: (this.getCustomerById(customerId)?.loyaltyPoints || 0) + points
    });
  }

  getGroups(): CustomerGroup[] {
    return this.groups();
  }

  addGroup(group: Omit<CustomerGroup, 'id'>): CustomerGroup {
    const newGroup: CustomerGroup = {
      ...group,
      id: uuid()
    };
    this.groups.update(groups => [...groups, newGroup]);
    return newGroup;
  }
}
