import { Injectable, signal, computed } from '@angular/core';
import { Expense, ExpenseCategory, ExpenseReport, Budget, Vendor } from '../models/expense.model';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses = signal<Expense[]>([]);
  private categories = signal<ExpenseCategory[]>([]);
  private reports = signal<ExpenseReport[]>([]);
  private budgets = signal<Budget[]>([]);
  private vendors = signal<Vendor[]>([]);

  expenses$ = computed(() => this.expenses());
  categories$ = computed(() => this.categories());
  reports$ = computed(() => this.reports());
  budgets$ = computed(() => this.budgets());
  vendors$ = computed(() => this.vendors());

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock expense categories
    const mockCategories: ExpenseCategory[] = [
      {
        id: uuid(),
        name: 'Office Supplies',
        description: 'Paper, pens, printer ink, etc.',
        budgetLimit: 500,
        color: '#3B82F6',
        icon: 'Package'
      },
      {
        id: uuid(),
        name: 'Utilities',
        description: 'Electricity, water, internet, phone',
        budgetLimit: 2000,
        color: '#10B981',
        icon: 'Zap'
      },
      {
        id: uuid(),
        name: 'Marketing',
        description: 'Advertising, promotions, events',
        budgetLimit: 1500,
        color: '#F59E0B',
        icon: 'Megaphone'
      },
      {
        id: uuid(),
        name: 'Maintenance',
        description: 'Repairs, maintenance services',
        budgetLimit: 1000,
        color: '#EF4444',
        icon: 'Wrench'
      },
      {
        id: uuid(),
        name: 'Travel',
        description: 'Business trips, transportation',
        budgetLimit: 800,
        color: '#8B5CF6',
        icon: 'Plane'
      },
      {
        id: uuid(),
        name: 'Inventory',
        description: 'Product purchases, stock replenishment',
        budgetLimit: 5000,
        color: '#EC4899',
        icon: 'ShoppingCart'
      }
    ];

    this.categories.set(mockCategories);

    // Mock vendors
    const mockVendors: Vendor[] = [
      {
        id: uuid(),
        name: 'Office Depot',
        contactPerson: 'John Manager',
        email: 'manager@officedepot.com',
        phone: '555-0201',
        address: {
          street: '100 Office Park',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        category: 'Office Supplies',
        paymentTerms: 'Net 30',
        taxId: '12-3456789',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'Con Edison',
        contactPerson: 'Service Rep',
        email: 'service@coned.com',
        phone: '555-0202',
        address: {
          street: '4 Irving Place',
          city: 'New York',
          state: 'NY',
          zipCode: '10003'
        },
        category: 'Utilities',
        paymentTerms: 'Monthly',
        taxId: '13-9876543',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.vendors.set(mockVendors);

    // Mock expenses
    const mockExpenses: Expense[] = [
      {
        id: uuid(),
        title: 'Printer Paper Purchase',
        description: '10 reams of white printer paper',
        amount: 89.99,
        category: mockCategories[0],
        date: new Date('2024-12-01'),
        status: 'approved',
        paymentMethod: 'card',
        receipt: 'receipt_001.pdf',
        submittedBy: 'John Smith',
        approvedBy: 'Sarah Johnson',
        approvedDate: new Date('2024-12-02'),
        paidDate: new Date('2024-12-03'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        title: 'Electric Bill',
        description: 'Monthly electricity payment',
        amount: 245.50,
        category: mockCategories[1],
        date: new Date('2024-12-05'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        submittedBy: 'John Smith',
        approvedBy: 'John Smith',
        approvedDate: new Date('2024-12-05'),
        paidDate: new Date('2024-12-05'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        title: 'Social Media Ads',
        description: 'Facebook and Instagram advertising campaign',
        amount: 350.00,
        category: mockCategories[2],
        date: new Date('2024-12-10'),
        status: 'pending',
        paymentMethod: 'card',
        submittedBy: 'Sarah Johnson',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.expenses.set(mockExpenses);

    // Mock budgets
    const mockBudgets: Budget[] = mockCategories.map(category => ({
      id: uuid(),
      categoryId: category.id,
      amount: category.budgetLimit || 1000,
      spent: this.calculateCategorySpent(category.id),
      remaining: (category.budgetLimit || 1000) - this.calculateCategorySpent(category.id),
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    this.budgets.set(mockBudgets);
  }

  private calculateCategorySpent(categoryId: string): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return this.expenses()
      .filter(expense => 
        expense.category.id === categoryId &&
        expense.status === 'paid' &&
        expense.date.getMonth() === currentMonth &&
        expense.date.getFullYear() === currentYear
      )
      .reduce((total, expense) => total + expense.amount, 0);
  }

  // Expense CRUD operations
  getExpenses(): Expense[] {
    return this.expenses();
  }

  getExpenseById(id: string): Expense | undefined {
    return this.expenses().find(expense => expense.id === id);
  }

  addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
    const newExpense: Expense = {
      ...expense,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.expenses.update(expenses => [...expenses, newExpense]);
    this.updateBudgetSpent(newExpense.category.id);
    return newExpense;
  }

  updateExpense(id: string, updates: Partial<Expense>): Expense | undefined {
    const expense = this.getExpenseById(id);
    if (!expense) return undefined;

    const updatedExpense = { ...expense, ...updates, updatedAt: new Date() };
    this.expenses.update(expenses => 
      expenses.map(exp => exp.id === id ? updatedExpense : exp)
    );
    
    this.updateBudgetSpent(updatedExpense.category.id);
    return updatedExpense;
  }

  deleteExpense(id: string): boolean {
    const expense = this.getExpenseById(id);
    if (!expense) return false;

    this.expenses.update(expenses => expenses.filter(exp => exp.id !== id));
    this.updateBudgetSpent(expense.category.id);
    return true;
  }

  searchExpenses(query: string): Expense[] {
    const lowerQuery = query.toLowerCase();
    return this.expenses().filter(expense => 
      expense.title.toLowerCase().includes(lowerQuery) ||
      expense.description.toLowerCase().includes(lowerQuery) ||
      expense.category.name.toLowerCase().includes(lowerQuery)
    );
  }

  getExpensesByCategory(categoryId: string): Expense[] {
    return this.expenses().filter(expense => expense.category.id === categoryId);
  }

  getExpensesByStatus(status: string): Expense[] {
    return this.expenses().filter(expense => expense.status === status);
  }

  getExpensesByDateRange(startDate: Date, endDate: Date): Expense[] {
    return this.expenses().filter(expense => 
      expense.date >= startDate && expense.date <= endDate
    );
  }

  // Category operations
  getCategories(): ExpenseCategory[] {
    return this.categories();
  }

  getCategoryById(id: string): ExpenseCategory | undefined {
    return this.categories().find(category => category.id === id);
  }

  addCategory(category: Omit<ExpenseCategory, 'id'>): ExpenseCategory {
    const newCategory: ExpenseCategory = {
      ...category,
      id: uuid()
    };
    
    this.categories.update(categories => [...categories, newCategory]);
    
    // Create budget for new category
    this.addBudget({
      categoryId: newCategory.id,
      amount: category.budgetLimit || 1000,
      spent: 0,
      remaining: category.budgetLimit || 1000,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      status: 'active'
    });
    
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<ExpenseCategory>): ExpenseCategory | undefined {
    const category = this.getCategoryById(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...updates };
    this.categories.update(categories => 
      categories.map(cat => cat.id === id ? updatedCategory : cat)
    );
    
    // Update budget if budget limit changed
    if (updates.budgetLimit !== undefined) {
      this.updateBudgetByCategory(id, updates.budgetLimit);
    }
    
    return updatedCategory;
  }

  // Budget operations
  getBudgets(): Budget[] {
    return this.budgets();
  }

  getBudgetByCategory(categoryId: string): Budget | undefined {
    return this.budgets().find(budget => budget.categoryId === categoryId);
  }

  addBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const newBudget: Budget = {
      ...budget,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.budgets.update(budgets => [...budgets, newBudget]);
    return newBudget;
  }

  updateBudgetSpent(categoryId: string): void {
    const budget = this.getBudgetByCategory(categoryId);
    if (!budget) return;

    const spent = this.calculateCategorySpent(categoryId);
    const remaining = budget.amount - spent;

    this.budgets.update(budgets => 
      budgets.map(b => 
        b.categoryId === categoryId 
          ? { ...b, spent, remaining, updatedAt: new Date() }
          : b
      )
    );
  }

  updateBudgetByCategory(categoryId: string, newAmount: number): void {
    const budget = this.getBudgetByCategory(categoryId);
    if (!budget) return;

    const spent = this.calculateCategorySpent(categoryId);
    const remaining = newAmount - spent;

    this.budgets.update(budgets => 
      budgets.map(b => 
        b.categoryId === categoryId 
          ? { ...b, amount: newAmount, spent, remaining, updatedAt: new Date() }
          : b
      )
    );
  }

  getBudgetAlerts(): Budget[] {
    return this.budgets().filter(budget => 
      budget.status === 'active' && 
      budget.remaining < budget.amount * 0.2 // Alert when less than 20% remaining
    );
  }

  // Vendor operations
  getVendors(): Vendor[] {
    return this.vendors();
  }

  getVendorById(id: string): Vendor | undefined {
    return this.vendors().find(vendor => vendor.id === id);
  }

  addVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Vendor {
    const newVendor: Vendor = {
      ...vendor,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.vendors.update(vendors => [...vendors, newVendor]);
    return newVendor;
  }

  updateVendor(id: string, updates: Partial<Vendor>): Vendor | undefined {
    const vendor = this.getVendorById(id);
    if (!vendor) return undefined;

    const updatedVendor = { ...vendor, ...updates, updatedAt: new Date() };
    this.vendors.update(vendors => 
      vendors.map(v => v.id === id ? updatedVendor : v)
    );
    
    return updatedVendor;
  }

  deleteVendor(id: string): boolean {
    const vendor = this.getVendorById(id);
    if (!vendor) return false;

    this.vendors.update(vendors => vendors.filter(v => v.id !== id));
    return true;
  }

  searchVendors(query: string): Vendor[] {
    const lowerQuery = query.toLowerCase();
    return this.vendors().filter(vendor => 
      vendor.name.toLowerCase().includes(lowerQuery) ||
      vendor.contactPerson.toLowerCase().includes(lowerQuery) ||
      vendor.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Report operations
  getReports(): ExpenseReport[] {
    return this.reports();
  }

  createReport(title: string, description: string, startDate: Date, endDate: Date, expenseIds: string[]): ExpenseReport {
    const totalAmount = expenseIds.reduce((total, expenseId) => {
      const expense = this.getExpenseById(expenseId);
      return total + (expense?.amount || 0);
    }, 0);

    const report: ExpenseReport = {
      id: uuid(),
      title,
      description,
      startDate,
      endDate,
      expenses: expenseIds,
      totalAmount,
      status: 'draft',
      submittedBy: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reports.update(reports => [...reports, report]);
    return report;
  }

  // Utility methods
  getTotalExpensesByDateRange(startDate: Date, endDate: Date): number {
    return this.expenses()
      .filter(expense => 
        expense.date >= startDate && 
        expense.date <= endDate &&
        expense.status === 'paid'
      )
      .reduce((total, expense) => total + expense.amount, 0);
  }

  getExpensesByMonth(year: number, month: number): Expense[] {
    return this.expenses().filter(expense => 
      expense.date.getFullYear() === year &&
      expense.date.getMonth() === month
    );
  }

  getMonthlyTotal(year: number, month: number): number {
    return this.getExpensesByMonth(year, month)
      .filter(expense => expense.status === 'paid')
      .reduce((total, expense) => total + expense.amount, 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  // Analytics
  getExpenseAnalytics() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = this.getMonthlyTotal(currentYear, currentMonth);
    const totalBudget = this.budgets()
      .filter(budget => budget.status === 'active')
      .reduce((total, budget) => total + budget.amount, 0);
    const totalSpent = this.budgets()
      .filter(budget => budget.status === 'active')
      .reduce((total, budget) => total + budget.spent, 0);
    
    return {
      monthlyExpenses,
      totalBudget,
      totalSpent,
      remainingBudget: totalBudget - totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      pendingExpenses: this.getExpensesByStatus('pending').length,
      budgetAlerts: this.getBudgetAlerts().length
    };
  }
}
