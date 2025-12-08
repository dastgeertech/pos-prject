import { Injectable, signal, computed } from '@angular/core';
import { v4 as uuid } from 'uuid';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: {
    primaryContact: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  payment: {
    terms: string;
    method: 'check' | 'wire' | 'credit_card' | 'ach';
    accountNumber?: string;
    routingNumber?: string;
  };
  products: string[]; // Product IDs they supply
  categories: string[];
  rating: number; // 1-5
  reliability: 'high' | 'medium' | 'low';
  leadTime: number; // days
  minimumOrder: number;
  taxId: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentDueDate: Date;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  margin: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber?: string;
  status: 'draft' | 'open' | 'partial' | 'paid' | 'overdue' | 'void';
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paymentTerms: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  accountId: string;
  expenseCategory: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  accountId: string;
  paymentMethod: 'cash' | 'check' | 'card' | 'transfer';
  reference?: string;
  receipt?: string; // URL to receipt image
  notes?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  budgetLimit?: number;
  isTaxDeductible: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subType: string;
  accountNumber: string;
  description: string;
  balance: number;
  isActive: boolean;
  parentAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  debitAccountId: string;
  creditAccountId: string;
  reference?: string;
  category: string;
  status: 'pending' | 'posted' | 'void';
  createdBy: string;
  approvedBy?: string;
  postedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed' | 'locked';
  fiscalYear: number;
  quarter: number;
  month: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReport {
  id: string;
  type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance' | 'aged_payables' | 'aged_receivables';
  title: string;
  description: string;
  period: FinancialPeriod;
  data: any;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients: string[];
}

export interface TaxConfiguration {
  id: string;
  name: string;
  type: 'sales_tax' | 'income_tax' | 'property_tax' | 'payroll_tax';
  rate: number;
  jurisdiction: string;
  accountIds: string[];
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  period: FinancialPeriod;
  status: 'draft' | 'active' | 'closed';
  items: BudgetItem[];
  totalBudgeted: number;
  totalActual: number;
  variance: number;
  variancePercentage: number;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetItem {
  id: string;
  accountId: string;
  accountName: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private suppliers = signal<Supplier[]>([]);
  private purchaseOrders = signal<PurchaseOrder[]>([]);
  private bills = signal<Bill[]>([]);
  private expenses = signal<Expense[]>([]);
  private expenseCategories = signal<ExpenseCategory[]>([]);
  private accounts = signal<Account[]>([]);
  private transactions = signal<Transaction[]>([]);
  private financialPeriods = signal<FinancialPeriod[]>([]);
  private financialReports = signal<FinancialReport[]>([]);
  private taxConfigurations = signal<TaxConfiguration[]>([]);
  private budgets = signal<Budget[]>([]);

  // Computed signals
  suppliers$ = computed(() => this.suppliers());
  purchaseOrders$ = computed(() => this.purchaseOrders());
  bills$ = computed(() => this.bills());
  expenses$ = computed(() => this.expenses());
  expenseCategories$ = computed(() => this.expenseCategories());
  accounts$ = computed(() => this.accounts());
  transactions$ = computed(() => this.transactions());
  financialPeriods$ = computed(() => this.financialPeriods());
  financialReports$ = computed(() => this.financialReports());
  taxConfigurations$ = computed(() => this.taxConfigurations());
  budgets$ = computed(() => this.budgets());

  constructor() {
    this.initializeMockData();
  }

  // Supplier Management
  createSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier {
    const supplier: Supplier = {
      id: uuid(),
      ...supplierData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.suppliers.update(suppliers => [...suppliers, supplier]);
    return supplier;
  }

  updateSupplier(supplierId: string, updates: Partial<Supplier>): Supplier | null {
    const suppliers = this.suppliers();
    const index = suppliers.findIndex(s => s.id === supplierId);
    
    if (index === -1) return null;

    const updatedSupplier = {
      ...suppliers[index],
      ...updates,
      updatedAt: new Date()
    };

    this.suppliers.update(sups => [...sups.slice(0, index), updatedSupplier, ...sups.slice(index + 1)]);
    return updatedSupplier;
  }

  getSuppliersByCategory(category: string): Supplier[] {
    return this.suppliers().filter(s => 
      s.categories.includes(category) && s.status === 'active'
    );
  }

  // Purchase Order Management
  createPurchaseOrder(
    supplierId: string,
    items: Omit<PurchaseOrderItem, 'id' | 'total' | 'receivedQuantity' | 'remainingQuantity' | 'margin'>[],
    createdBy: string,
    expectedDeliveryDate?: Date
  ): PurchaseOrder {
    const supplier = this.suppliers().find(s => s.id === supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const orderItems = items.map(item => ({
      ...item,
      id: uuid(),
      total: item.quantity * item.unitPrice,
      receivedQuantity: 0,
      remainingQuantity: item.quantity,
      margin: ((item.unitPrice - item.unitCost) / item.unitPrice) * 100
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = 25; // Fixed shipping
    const total = subtotal + tax + shipping;

    const purchaseOrder: PurchaseOrder = {
      id: uuid(),
      orderNumber: this.generatePurchaseOrderNumber(),
      supplierId,
      supplierName: supplier.name,
      status: 'draft',
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      orderDate: new Date(),
      expectedDeliveryDate,
      paymentStatus: 'pending',
      paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.purchaseOrders.update(orders => [...orders, purchaseOrder]);
    return purchaseOrder;
  }

  updatePurchaseOrderStatus(orderId: string, status: PurchaseOrder['status'], approvedBy?: string): boolean {
    const order = this.purchaseOrders().find(o => o.id === orderId);
    if (!order) return false;

    const updatedOrder = {
      ...order,
      status,
      approvedBy,
      updatedAt: new Date()
    };

    this.purchaseOrders.update(orders => 
      orders.map(o => o.id === orderId ? updatedOrder : o)
    );

    // Create bill if order is confirmed
    if (status === 'confirmed') {
      this.createBillFromPurchaseOrder(updatedOrder);
    }

    return true;
  }

  // Bill Management
  createBill(billData: Omit<Bill, 'id' | 'billNumber' | 'balance' | 'createdAt' | 'updatedAt'>): Bill {
    const bill: Bill = {
      id: uuid(),
      balance: billData.total - billData.paidAmount,
      ...billData,
      billNumber: this.generateBillNumber(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bills.update(bills => [...bills, bill]);
    return bill;
  }

  createBillFromPurchaseOrder(purchaseOrder: PurchaseOrder): Bill {
    const billItems: BillItem[] = purchaseOrder.items.map(item => ({
      id: uuid(),
      description: `${item.productName} (${item.sku})`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      accountId: 'cost_of_goods_sold',
      expenseCategory: 'inventory'
    }));

    const bill: Bill = {
      id: uuid(),
      billNumber: this.generateBillNumber(),
      supplierId: purchaseOrder.supplierId,
      supplierName: purchaseOrder.supplierName,
      status: 'open',
      items: billItems,
      subtotal: purchaseOrder.subtotal,
      tax: purchaseOrder.tax,
      total: purchaseOrder.total,
      paidAmount: 0,
      balance: purchaseOrder.total,
      issueDate: new Date(),
      dueDate: purchaseOrder.paymentDueDate,
      paymentTerms: 'Net 30',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bills.update(bills => [...bills, bill]);
    return bill;
  }

  payBill(billId: string, amount: number, paymentMethod: string, reference?: string): boolean {
    const bill = this.bills().find(b => b.id === billId);
    if (!bill || amount > bill.balance) return false;

    const updatedBill = {
      ...bill,
      paidAmount: bill.paidAmount + amount,
      balance: bill.balance - amount,
      status: (bill.balance - amount === 0 ? 'paid' : 'partial') as Bill['status'],
      paidDate: bill.balance - amount === 0 ? new Date() : bill.paidDate,
      updatedAt: new Date()
    };

    this.bills.update(bills => 
      bills.map(b => b.id === billId ? updatedBill : b)
    );

    // Create transaction
    this.createTransaction(
      new Date(),
      `Payment to ${bill.supplierName}`,
      amount,
      'accounts_payable',
      'cash',
      reference
    );

    return true;
  }

  // Expense Management
  createExpense(expenseData: Omit<Expense, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Expense {
    const expense: Expense = {
      id: uuid(),
      status: 'pending',
      ...expenseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.expenses.update(expenses => [...expenses, expense]);
    return expense;
  }

  approveExpense(expenseId: string, approvedBy: string): boolean {
    const expense = this.expenses().find(e => e.id === expenseId);
    if (!expense || expense.status !== 'pending') return false;

    const updatedExpense = {
      ...expense,
      status: 'approved' as const,
      approvedBy,
      updatedAt: new Date()
    };

    this.expenses.update(expenses => 
      expenses.map(e => e.id === expenseId ? updatedExpense : e)
    );

    // Create transaction
    this.createTransaction(
      expense.date,
      expense.description,
      expense.amount,
      expense.category.name,
      'cash',
      expense.reference
    );

    return true;
  }

  // Accounting Management
  createTransaction(
    date: Date,
    description: string,
    amount: number,
    debitAccountId: string,
    creditAccountId: string,
    reference?: string,
    category: string = 'general'
  ): Transaction {
    const transaction: Transaction = {
      id: uuid(),
      date,
      description,
      amount,
      debitAccountId,
      creditAccountId,
      reference,
      category,
      status: 'posted',
      createdBy: 'system',
      postedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.transactions.update(transactions => [...transactions, transaction]);
    
    // Update account balances
    this.updateAccountBalance(debitAccountId, amount);
    this.updateAccountBalance(creditAccountId, -amount);
    
    return transaction;
  }

  private updateAccountBalance(accountId: string, amount: number): void {
    const account = this.accounts().find(a => a.id === accountId);
    if (!account) return;

    const updatedBalance = account.balance + amount;
    this.accounts.update(accounts => 
      accounts.map(a => a.id === accountId ? { ...a, balance: updatedBalance } : a)
    );
  }

  // Financial Reporting
  generateBalanceSheet(periodId: string): FinancialReport {
    const period = this.financialPeriods().find(p => p.id === periodId);
    if (!period) throw new Error('Period not found');

    const assets = this.calculateAssets(period);
    const liabilities = this.calculateLiabilities(period);
    const equity = this.calculateEquity(period);

    const report: FinancialReport = {
      id: uuid(),
      type: 'balance_sheet',
      title: 'Balance Sheet',
      description: `Balance sheet for ${period.name}`,
      period,
      data: {
        assets,
        liabilities,
        equity,
        totalAssets: assets.total,
        totalLiabilities: liabilities.total,
        totalEquity: equity.total,
        checkBalance: assets.total - (liabilities.total + equity.total)
      },
      generatedAt: new Date(),
      generatedBy: 'system',
      format: 'pdf',
      isScheduled: false,
      recipients: []
    };

    this.financialReports.update(reports => [...reports, report]);
    return report;
  }

  generateIncomeStatement(periodId: string): FinancialReport {
    const period = this.financialPeriods().find(p => p.id === periodId);
    if (!period) throw new Error('Period not found');

    const revenue = this.calculateRevenue(period);
    const expenses = this.calculateExpenses(period);
    const netIncome = revenue.total - expenses.total;

    const report: FinancialReport = {
      id: uuid(),
      type: 'income_statement',
      title: 'Income Statement',
      description: `Income statement for ${period.name}`,
      period,
      data: {
        revenue,
        expenses,
        netIncome,
        grossProfit: revenue.total - expenses.costOfGoodsSold,
        operatingIncome: netIncome - expenses.other,
        netProfitMargin: revenue.total > 0 ? (netIncome / revenue.total) * 100 : 0
      },
      generatedAt: new Date(),
      generatedBy: 'system',
      format: 'pdf',
      isScheduled: false,
      recipients: []
    };

    this.financialReports.update(reports => [...reports, report]);
    return report;
  }

  // Budget Management
  createBudget(
    name: string,
    periodId: string,
    items: Omit<BudgetItem, 'actualAmount' | 'variance' | 'variancePercentage'>[],
    createdBy: string
  ): Budget {
    const period = this.financialPeriods().find(p => p.id === periodId);
    if (!period) throw new Error('Period not found');

    const budgetItems = items.map(item => ({
      ...item,
      actualAmount: 0,
      variance: -item.budgetedAmount,
      variancePercentage: -100
    }));

    const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.budgetedAmount, 0);

    const budget: Budget = {
      id: uuid(),
      name,
      period,
      status: 'draft',
      items: budgetItems,
      totalBudgeted,
      totalActual: 0,
      variance: -totalBudgeted,
      variancePercentage: -100,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.budgets.update(budgets => [...budgets, budget]);
    return budget;
  }

  // Analytics
  getBusinessAnalytics(dateRange: { start: Date; end: Date }): {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
    topSuppliers: Array<{
      supplier: Supplier;
      totalPurchases: number;
      orderCount: number;
    }>;
    expenseBreakdown: Record<string, number>;
    agedPayables: {
      current: number;
      '1-30': number;
      '31-60': number;
      '61-90': number;
      '90+': number;
    };
    accountsReceivable: number;
    accountsPayable: number;
    cashFlow: number;
  } {
    const bills = this.bills().filter(b => 
      b.issueDate >= dateRange.start && b.issueDate <= dateRange.end
    );

    const expenses = this.expenses().filter(e => 
      e.date >= dateRange.start && e.date <= dateRange.end
    );

    const totalExpenses = bills.reduce((sum, bill) => sum + bill.total, 0) + 
                          expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate revenue (would come from sales data)
    const totalRevenue = 125000; // Placeholder

    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    // Top suppliers
    const supplierPurchases = this.purchaseOrders()
      .filter(po => po.orderDate >= dateRange.start && po.orderDate <= dateRange.end)
      .reduce((purchases, po) => {
        const existing = purchases.find(p => p.supplier.id === po.supplierId);
        if (existing) {
          existing.totalPurchases += po.total;
          existing.orderCount += 1;
        } else {
          const supplier = this.suppliers().find(s => s.id === po.supplierId);
          if (supplier) {
            purchases.push({
              supplier,
              totalPurchases: po.total,
              orderCount: 1
            });
          }
        }
        return purchases;
      }, [] as Array<{ supplier: Supplier; totalPurchases: number; orderCount: number }>);

    const topSuppliers = supplierPurchases
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 10);

    // Expense breakdown
    const expenseBreakdown = expenses.reduce((breakdown, expense) => {
      const category = expense.category.name;
      breakdown[category] = (breakdown[category] || 0) + expense.amount;
      return breakdown;
    }, {} as Record<string, number>);

    // Aged payables
    const now = new Date();
    const agedPayables = bills.reduce((aged, bill) => {
      if (bill.balance <= 0) return aged;
      
      const daysOverdue = Math.ceil((now.getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue <= 0) aged.current += bill.balance;
      else if (daysOverdue <= 30) aged['1-30'] += bill.balance;
      else if (daysOverdue <= 60) aged['31-60'] += bill.balance;
      else if (daysOverdue <= 90) aged['61-90'] += bill.balance;
      else aged['90+'] += bill.balance;
      
      return aged;
    }, { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 });

    // Account balances
    const accountsReceivable = this.accounts()
      .find(a => a.accountNumber === '1200')?.balance || 0;
    const accountsPayable = this.accounts()
      .find(a => a.accountNumber === '2000')?.balance || 0;
    const cashBalance = this.accounts()
      .find(a => a.accountNumber === '1000')?.balance || 0;

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMargin,
      topSuppliers,
      expenseBreakdown,
      agedPayables,
      accountsReceivable,
      accountsPayable,
      cashFlow: cashBalance
    };
  }

  // Private helper methods
  private calculateAssets(period: FinancialPeriod): any {
    const cash = this.accounts().find(a => a.accountNumber === '1000')?.balance || 0;
    const accountsReceivable = this.accounts().find(a => a.accountNumber === '1200')?.balance || 0;
    const inventory = this.accounts().find(a => a.accountNumber === '1300')?.balance || 0;

    return {
      current: { cash, accountsReceivable, inventory, total: cash + accountsReceivable + inventory },
      fixed: { equipment: 50000, total: 50000 },
      total: cash + accountsReceivable + inventory + 50000
    };
  }

  private calculateLiabilities(period: FinancialPeriod): any {
    const accountsPayable = this.accounts().find(a => a.accountNumber === '2000')?.balance || 0;
    const taxes = this.accounts().find(a => a.accountNumber === '2100')?.balance || 0;

    return {
      current: { accountsPayable, taxes, total: accountsPayable + taxes },
      longTerm: { loans: 100000, total: 100000 },
      total: accountsPayable + taxes + 100000
    };
  }

  private calculateEquity(period: FinancialPeriod): any {
    const ownerEquity = this.accounts().find(a => a.accountNumber === '3000')?.balance || 0;
    const retainedEarnings = this.accounts().find(a => a.accountNumber === '3100')?.balance || 0;

    return {
      ownerEquity,
      retainedEarnings,
      total: ownerEquity + retainedEarnings
    };
  }

  private calculateRevenue(period: FinancialPeriod): any {
    // This would calculate actual revenue from sales data
    return {
      sales: 125000,
      services: 15000,
      other: 2000,
      total: 142000
    };
  }

  private calculateExpenses(period: FinancialPeriod): any {
    const costOfGoodsSold = 75000;
    const operating = 25000;
    const other = 5000;

    return {
      costOfGoodsSold,
      operating,
      other,
      total: costOfGoodsSold + operating + other
    };
  }

  private generatePurchaseOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    return `PO-${year}-${String(sequence).padStart(4, '0')}`;
  }

  private generateBillNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    return `B-${year}-${String(sequence).padStart(4, '0')}`;
  }

  private initializeMockData(): void {
    // Initialize suppliers
    const mockSuppliers: Supplier[] = [
      {
        id: uuid(),
        name: 'Global Supply Co.',
        code: 'GS001',
        contact: {
          primaryContact: 'John Smith',
          email: 'john@globalsupply.com',
          phone: '555-0101',
          address: {
            street: '123 Supplier St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          }
        },
        payment: {
          terms: 'Net 30',
          method: 'wire',
          accountNumber: '123456789',
          routingNumber: '021000021'
        },
        products: [],
        categories: ['electronics', 'accessories'],
        rating: 4.5,
        reliability: 'high',
        leadTime: 7,
        minimumOrder: 1000,
        taxId: '12-3456789',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.suppliers.set(mockSuppliers);

    // Initialize accounts
    const mockAccounts: Account[] = [
      { id: uuid(), name: 'Cash', type: 'asset', subType: 'current', accountNumber: '1000', description: 'Cash on hand', balance: 25000, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuid(), name: 'Accounts Receivable', type: 'asset', subType: 'current', accountNumber: '1200', description: 'Money owed by customers', balance: 15000, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuid(), name: 'Inventory', type: 'asset', subType: 'current', accountNumber: '1300', description: 'Inventory value', balance: 50000, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuid(), name: 'Accounts Payable', type: 'liability', subType: 'current', accountNumber: '2000', description: 'Money owed to suppliers', balance: 12000, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuid(), name: 'Owner Equity', type: 'equity', subType: 'capital', accountNumber: '3000', description: 'Owner investment', balance: 78000, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    this.accounts.set(mockAccounts);

    // Initialize expense categories
    const mockCategories: ExpenseCategory[] = [
      { id: uuid(), name: 'Office Supplies', description: 'Office supplies and materials', budgetLimit: 500, isTaxDeductible: true, isActive: true, createdAt: new Date() },
      { id: uuid(), name: 'Utilities', description: 'Electricity, water, internet', budgetLimit: 1000, isTaxDeductible: true, isActive: true, createdAt: new Date() },
      { id: uuid(), name: 'Marketing', description: 'Marketing and advertising', budgetLimit: 2000, isTaxDeductible: true, isActive: true, createdAt: new Date() }
    ];

    this.expenseCategories.set(mockCategories);

    // Initialize financial periods
    const currentYear = new Date().getFullYear();
    const mockPeriods: FinancialPeriod[] = [];
    
    for (let quarter = 1; quarter <= 4; quarter++) {
      for (let month = (quarter - 1) * 3 + 1; month <= quarter * 3; month++) {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0);
        
        mockPeriods.push({
          id: uuid(),
          name: `${currentYear} Q${quarter} - Month ${month}`,
          startDate,
          endDate,
          status: month === new Date().getMonth() + 1 ? 'open' : 'closed',
          fiscalYear: currentYear,
          quarter,
          month,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    this.financialPeriods.set(mockPeriods);
  }
}
