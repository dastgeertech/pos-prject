import { Injectable, signal, computed } from '@angular/core';
import { Cart } from '../models/cart.model';
import { Customer } from '../models/customer.model';
import { v4 as uuid } from 'uuid';

export interface PaymentProcessor {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'check' | 'digital_wallet' | 'gift_card' | 'store_credit';
  isActive: boolean;
  supportedMethods: PaymentMethodType[];
  fees: {
    flat: number;
    percentage: number;
  };
  config: PaymentProcessorConfig;
}

export interface PaymentProcessorConfig {
  apiKey?: string;
  merchantId?: string;
  terminalId?: string;
  environment: 'test' | 'production';
  webhookUrl?: string;
  customSettings?: Record<string, any>;
}

export interface PaymentMethodType {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'check' | 'digital_wallet' | 'gift_card' | 'store_credit';
  icon: string;
  requiresProcessing: boolean;
  supportedCardTypes?: string[];
}

export interface PaymentTransaction {
  id: string;
  cartId: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: PaymentMethod;
  processor: PaymentProcessor;
  authorizationCode?: string;
  transactionId?: string;
  referenceNumber?: string;
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType['type'];
  subtype?: string;
  details: PaymentMethodDetails;
  isDefault?: boolean;
  isSaved?: boolean;
  customerId?: string;
}

export interface PaymentMethodDetails {
  // Credit/Debit Card
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvv?: string;
  cardType?: string;
  lastFour?: string;
  
  // Digital Wallet
  walletProvider?: 'apple_pay' | 'google_pay' | 'paypal' | 'venmo' | 'cashapp';
  walletId?: string;
  
  // Check
  checkNumber?: string;
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
  
  // Gift Card
  giftCardNumber?: string;
  pin?: string;
  balance?: number;
  
  // Store Credit
  creditAmount?: number;
  expirationDate?: Date;
}

export interface Refund {
  id: string;
  originalTransactionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  processedAt?: Date;
  createdAt: Date;
}

export interface PaymentSplit {
  id: string;
  transactionId: string;
  paymentMethods: Array<{
    paymentMethod: PaymentMethod;
    amount: number;
  }>;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private transactions = signal<PaymentTransaction[]>([]);
  private processors = signal<PaymentProcessor[]>([]);
  private paymentMethods = signal<PaymentMethodType[]>([]);
  private refunds = signal<Refund[]>([]);

  transactions$ = computed(() => this.transactions());
  processors$ = computed(() => this.processors());
  paymentMethods$ = computed(() => this.paymentMethods());
  refunds$ = computed(() => this.refunds());

  constructor() {
    this.initializePaymentMethods();
    this.initializeProcessors();
  }

  // Process payment
  async processPayment(
    cart: Cart,
    paymentMethod: PaymentMethod,
    customerId?: string
  ): Promise<PaymentTransaction> {
    const processor = this.getProcessorForMethod(paymentMethod.type);
    if (!processor) {
      throw new Error(`No processor found for payment method: ${paymentMethod.type}`);
    }

    const transaction: PaymentTransaction = {
      id: uuid(),
      cartId: cart.id,
      customerId,
      amount: cart.total,
      currency: 'USD',
      status: 'pending',
      paymentMethod,
      processor,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.transactions.update(transactions => [...transactions, transaction]);

    try {
      const result = await this.executePayment(transaction, processor);
      
      const updatedTransaction = {
        ...transaction,
        status: 'completed' as const,
        processedAt: new Date(),
        updatedAt: new Date()
      };

      this.updateTransaction(updatedTransaction);
      return updatedTransaction;
    } catch (error) {
      const failedTransaction = {
        ...transaction,
        status: 'failed' as const,
        failureReason: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date()
      };

      this.updateTransaction(failedTransaction);
      throw failedTransaction;
    }
  }

  // Process split payment
  async processSplitPayment(
    cart: Cart,
    paymentSplits: Array<{ paymentMethod: PaymentMethod; amount: number }>,
    customerId?: string
  ): Promise<PaymentTransaction[]> {
    const totalSplitAmount = paymentSplits.reduce((sum, split) => sum + split.amount, 0);
    
    if (Math.abs(totalSplitAmount - cart.total) > 0.01) {
      throw new Error('Split payment amounts must equal cart total');
    }

    const transactions: PaymentTransaction[] = [];

    for (const split of paymentSplits) {
      const transaction = await this.processPayment(
        { ...cart, total: split.amount },
        split.paymentMethod,
        customerId
      );
      transactions.push(transaction);
    }

    return transactions;
  }

  // Process refund
  async processRefund(
    originalTransactionId: string,
    amount: number,
    reason: string
  ): Promise<Refund> {
    const originalTransaction = this.getTransaction(originalTransactionId);
    if (!originalTransaction) {
      throw new Error('Original transaction not found');
    }

    if (amount > originalTransaction.amount) {
      throw new Error('Refund amount cannot exceed original transaction amount');
    }

    const refund: Refund = {
      id: uuid(),
      originalTransactionId,
      amount,
      reason,
      status: 'pending',
      createdAt: new Date()
    };

    this.refunds.update(refunds => [...refunds, refund]);

    try {
      // Simulate refund processing
      await this.executeRefund(originalTransaction, amount);
      
      const processedRefund = {
        ...refund,
        status: 'processed' as const,
        processedAt: new Date()
      };

      this.updateRefund(processedRefund);
      return processedRefund;
    } catch (error) {
      const failedRefund = {
        ...refund,
        status: 'failed' as const
      };

      this.updateRefund(failedRefund);
      throw failedRefund;
    }
  }

  // Validate payment method
  validatePaymentMethod(paymentMethod: PaymentMethod): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (paymentMethod.type) {
      case 'credit_card':
      case 'debit_card':
        if (!paymentMethod.details.cardNumber) errors.push('Card number is required');
        if (!paymentMethod.details.cardholderName) errors.push('Cardholder name is required');
        if (!paymentMethod.details.expiryDate) errors.push('Expiry date is required');
        if (!paymentMethod.details.cvv) errors.push('CVV is required');
        break;

      case 'check':
        if (!paymentMethod.details.checkNumber) errors.push('Check number is required');
        if (!paymentMethod.details.bankName) errors.push('Bank name is required');
        break;

      case 'gift_card':
        if (!paymentMethod.details.giftCardNumber) errors.push('Gift card number is required');
        break;

      case 'digital_wallet':
        if (!paymentMethod.details.walletProvider) errors.push('Wallet provider is required');
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate processing fees
  calculateProcessingFee(amount: number, processor: PaymentProcessor): number {
    return processor.fees.flat + (amount * processor.fees.percentage / 100);
  }

  // Get available payment methods
  getAvailablePaymentMethods(): PaymentMethodType[] {
    return this.paymentMethods().filter(method => {
      const processor = this.getProcessorForMethod(method.type);
      return processor?.isActive || false;
    });
  }

  // Get saved payment methods for customer
  getSavedPaymentMethods(customerId: string): PaymentMethod[] {
    // This would typically come from a database
    return [];
  }

  // Save payment method for customer
  async savePaymentMethod(
    customerId: string,
    paymentMethod: PaymentMethod
  ): Promise<PaymentMethod> {
    const savedMethod = {
      ...paymentMethod,
      id: uuid(),
      isSaved: true,
      customerId
    };

    // This would typically save to a database
    return savedMethod;
  }

  // Get transaction by ID
  getTransaction(transactionId: string): PaymentTransaction | null {
    return this.transactions().find(t => t.id === transactionId) || null;
  }

  // Get transactions for customer
  getTransactionsForCustomer(customerId: string): PaymentTransaction[] {
    return this.transactions().filter(t => t.customerId === customerId);
  }

  // Get daily sales summary
  getDailySalesSummary(date: Date = new Date()): {
    totalSales: number;
    transactionCount: number;
    averageTransaction: number;
    paymentMethodBreakdown: Record<string, number>;
  } {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayTransactions = this.transactions().filter(t => 
      t.status === 'completed' &&
      t.processedAt &&
      t.processedAt >= dayStart &&
      t.processedAt <= dayEnd
    );

    const totalSales = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = dayTransactions.length;
    const averageTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

    const paymentMethodBreakdown = dayTransactions.reduce((breakdown, t) => {
      const method = t.paymentMethod.type;
      breakdown[method] = (breakdown[method] || 0) + t.amount;
      return breakdown;
    }, {} as Record<string, number>);

    return {
      totalSales,
      transactionCount,
      averageTransaction,
      paymentMethodBreakdown
    };
  }

  // Private methods
  private async executePayment(
    transaction: PaymentTransaction,
    processor: PaymentProcessor
  ): Promise<Partial<PaymentTransaction>> {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Payment processing failed');
    }

    return {
      authorizationCode: `AUTH${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      referenceNumber: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }

  private async executeRefund(
    originalTransaction: PaymentTransaction,
    amount: number
  ): Promise<void> {
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Simulate occasional failures (3% failure rate)
    if (Math.random() < 0.03) {
      throw new Error('Refund processing failed');
    }
  }

  private getProcessorForMethod(methodType: PaymentMethodType['type']): PaymentProcessor | null {
    return this.processors().find(p => 
      p.isActive && p.supportedMethods.some(m => m.type === methodType)
    ) || null;
  }

  private updateTransaction(transaction: PaymentTransaction): void {
    this.transactions.update(transactions => 
      transactions.map(t => t.id === transaction.id ? transaction : t)
    );
  }

  private updateRefund(refund: Refund): void {
    this.refunds.update(refunds => 
      refunds.map(r => r.id === refund.id ? refund : r)
    );
  }

  private initializePaymentMethods(): void {
    const methods: PaymentMethodType[] = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        type: 'credit_card',
        icon: 'credit-card',
        requiresProcessing: true,
        supportedCardTypes: ['visa', 'mastercard', 'amex', 'discover']
      },
      {
        id: 'debit_card',
        name: 'Debit Card',
        type: 'debit_card',
        icon: 'credit-card',
        requiresProcessing: true,
        supportedCardTypes: ['visa', 'mastercard']
      },
      {
        id: 'cash',
        name: 'Cash',
        type: 'cash',
        icon: 'dollar-sign',
        requiresProcessing: false
      },
      {
        id: 'check',
        name: 'Check',
        type: 'check',
        icon: 'file-text',
        requiresProcessing: false
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        type: 'digital_wallet',
        icon: 'smartphone',
        requiresProcessing: true
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        type: 'digital_wallet',
        icon: 'smartphone',
        requiresProcessing: true
      },
      {
        id: 'gift_card',
        name: 'Gift Card',
        type: 'gift_card',
        icon: 'gift',
        requiresProcessing: false
      },
      {
        id: 'store_credit',
        name: 'Store Credit',
        type: 'store_credit',
        icon: 'credit-card',
        requiresProcessing: false
      }
    ];

    this.paymentMethods.set(methods);
  }

  private initializeProcessors(): void {
    // Get reference to payment methods
    const methods = this.paymentMethods();
    const creditCardMethod = methods.find(m => m.id === 'credit_card');
    const debitCardMethod = methods.find(m => m.id === 'debit_card');
    const applePayMethod = methods.find(m => m.id === 'apple_pay');
    const googlePayMethod = methods.find(m => m.id === 'google_pay');

    const processors: PaymentProcessor[] = [
      {
        id: 'stripe',
        name: 'Stripe',
        type: 'credit_card',
        isActive: true,
        supportedMethods: [creditCardMethod!, debitCardMethod!].filter(Boolean),
        fees: { flat: 0.30, percentage: 2.9 },
        config: {
          environment: 'test',
          apiKey: 'pk_test_...'
        }
      },
      {
        id: 'paypal',
        name: 'PayPal',
        type: 'digital_wallet',
        isActive: true,
        supportedMethods: [applePayMethod!, googlePayMethod!].filter(Boolean),
        fees: { flat: 0.30, percentage: 2.9 },
        config: {
          environment: 'test',
          merchantId: 'test_merchant'
        }
      },
      {
        id: 'square',
        name: 'Square',
        type: 'credit_card',
        isActive: true,
        supportedMethods: [creditCardMethod!, debitCardMethod!].filter(Boolean),
        fees: { flat: 0.10, percentage: 2.6 },
        config: {
          environment: 'test',
          terminalId: 'test_terminal'
        }
      }
    ];

    this.processors.set(processors);
  }
}
