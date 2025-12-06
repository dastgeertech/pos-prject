export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check';
  receipt?: string;
  notes?: string;
  submittedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  budgetLimit?: number;
  color: string;
  icon?: string;
}

export interface ExpenseReport {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  expenses: string[]; // Expense IDs
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  category: string;
  paymentTerms: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
