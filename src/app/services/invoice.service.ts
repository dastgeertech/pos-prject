import { Injectable } from '@angular/core';
import { computed, signal } from '@angular/core';
import { Cart, CartItem } from '../models/cart.model';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/cart.model';
import { v4 as uuid } from 'uuid';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  transactionId: string;
  customerId?: string;
  customerInfo?: Customer;
  date: Date;
  dueDate?: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  paymentTerms: string;
  notes?: string;
  paymentMethods: PaymentMethod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  subtotal: number;
  total: number;
}

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'card' | 'check' | 'digital' | 'credit' | 'gift_card';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  details?: {
    cardType?: string;
    lastFour?: string;
    checkNumber?: string;
    transactionId?: string;
    authCode?: string;
  };
  processedAt: Date;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  type: 'standard' | 'proforma' | 'receipt' | 'credit_note';
  header: {
    logo?: string;
    companyName: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    taxId?: string;
  };
  footer: {
    paymentTerms: string;
    thankYouMessage: string;
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      routingNumber: string;
    };
  };
  customFields?: Array<{
    name: string;
    value: string;
    position: 'header' | 'footer' | 'items';
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoices = signal<Invoice[]>([]);
  private templates = signal<InvoiceTemplate[]>([]);

  invoices$ = computed(() => this.invoices());
  templates$ = computed(() => this.templates());

  constructor() {
    this.initializeTemplates();
    this.loadMockInvoices();
  }

  // Generate invoice from transaction
  generateInvoice(transaction: Transaction, cart: Cart, customer?: Customer): Invoice {
    const invoiceNumber = this.generateInvoiceNumber();
    
    const invoiceItems: InvoiceItem[] = cart.items.map(item => ({
      id: uuid(),
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku || '',
      description: item.product.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      discountType: item.discountType,
      tax: item.tax,
      subtotal: item.subtotal,
      total: item.total
    }));

    const paymentMethods: PaymentMethod[] = [{
      id: uuid(),
      type: transaction.paymentMethod,
      amount: transaction.amount,
      status: 'completed',
      processedAt: transaction.timestamp
    }];

    const invoice: Invoice = {
      id: uuid(),
      invoiceNumber,
      transactionId: transaction.id,
      customerId: customer?.id,
      customerInfo: customer,
      date: transaction.timestamp,
      dueDate: this.calculateDueDate(transaction.timestamp),
      status: 'paid',
      items: invoiceItems,
      subtotal: cart.subtotal,
      tax: cart.tax,
      discount: cart.discount,
      total: cart.total,
      paidAmount: transaction.amount,
      balance: 0,
      paymentTerms: 'Due on receipt',
      paymentMethods,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.invoices.update(invoices => [...invoices, invoice]);
    return invoice;
  }

  // Create proforma invoice
  createProformaInvoice(cart: Cart, customer?: Customer): Invoice {
    const invoiceNumber = this.generateInvoiceNumber('PF');
    
    const invoiceItems: InvoiceItem[] = cart.items.map(item => ({
      id: uuid(),
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku || '',
      description: item.product.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      discountType: item.discountType,
      tax: item.tax,
      subtotal: item.subtotal,
      total: item.total
    }));

    const invoice: Invoice = {
      id: uuid(),
      invoiceNumber,
      transactionId: '',
      customerId: customer?.id,
      customerInfo: customer,
      date: new Date(),
      dueDate: this.calculateDueDate(new Date(), 30),
      status: 'draft',
      items: invoiceItems,
      subtotal: cart.subtotal,
      tax: cart.tax,
      discount: cart.discount,
      total: cart.total,
      paidAmount: 0,
      balance: cart.total,
      paymentTerms: 'Net 30',
      paymentMethods: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.invoices.update(invoices => [...invoices, invoice]);
    return invoice;
  }

  // Update invoice
  updateInvoice(invoiceId: string, updates: Partial<Invoice>): Invoice | null {
    const invoices = this.invoices();
    const index = invoices.findIndex((inv: Invoice) => inv.id === invoiceId);
    
    if (index === -1) return null;

    const updatedInvoice = {
      ...invoices[index],
      ...updates,
      updatedAt: new Date()
    };

    this.invoices.update((inv: Invoice[]) => [
      ...inv.slice(0, index),
      updatedInvoice,
      ...inv.slice(index + 1)
    ]);

    return updatedInvoice;
  }

  // Add payment to invoice
  addPayment(invoiceId: string, paymentMethod: Omit<PaymentMethod, 'id' | 'processedAt'>): Invoice | null {
    const invoice = this.invoices().find((inv: Invoice) => inv.id === invoiceId);
    if (!invoice) return null;

    const newPayment: PaymentMethod = {
      ...paymentMethod,
      id: uuid(),
      processedAt: new Date()
    };

    const updatedPayments = [...invoice.paymentMethods, newPayment];
    const totalPaid = updatedPayments.reduce((sum, pm) => sum + pm.amount, 0);
    
    return this.updateInvoice(invoiceId, {
      paymentMethods: updatedPayments,
      paidAmount: totalPaid,
      balance: invoice.total - totalPaid,
      status: totalPaid >= invoice.total ? 'paid' : totalPaid > 0 ? 'sent' : 'draft'
    });
  }

  // Get invoice by ID
  getInvoice(invoiceId: string): Invoice | null {
    return this.invoices().find((inv: Invoice) => inv.id === invoiceId) || null;
  }

  // Get invoices by status
  getInvoicesByStatus(status: Invoice['status']): Invoice[] {
    return this.invoices().filter((inv: Invoice) => inv.status === status);
  }

  // Get overdue invoices
  getOverdueInvoices(): Invoice[] {
    return this.invoices().filter((inv: Invoice) => {
      return inv.status !== 'paid' && inv.status !== 'cancelled' && 
             inv.dueDate && new Date() > inv.dueDate;
    });
  }

  // Generate invoice PDF (placeholder)
  generateInvoicePDF(invoiceId: string): Invoice | null {
    const invoice = this.invoices().find((inv: Invoice) => inv.id === invoiceId);
    if (!invoice) return null;

    // PDF generation logic would go here
    // For now, just return the invoice
    return invoice;
  }

  // Send invoice email
  sendInvoiceEmail(invoiceId: string): Invoice | null {
    const invoice = this.invoices().find((inv: Invoice) => inv.id === invoiceId);
    if (!invoice) return null;

    // Email sending logic would go here
    // For now, just return the invoice
    return invoice;
  }

  // Private methods
  private generateInvoiceNumber(prefix: string = 'INV'): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 9999) + 1;
    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  private calculateDueDate(date: Date, days: number = 0): Date {
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  }

  private generateInvoiceHTML(invoice: Invoice, template?: InvoiceTemplate): string {
    const t = template || this.templates()[0];
    
    return `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .totals { text-align: right; margin-bottom: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <div class="company-info">
              <h2>${t.header.companyName}</h2>
              <p>${t.header.address}</p>
              <p>${t.header.phone} | ${t.header.email}</p>
            </div>
          </div>
          
          <div class="invoice-details">
            <div>
              <strong>Invoice Number:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${invoice.date.toLocaleDateString()}<br>
              <strong>Due Date:</strong> ${invoice.dueDate?.toLocaleDateString() || 'N/A'}<br>
              <strong>Status:</strong> ${invoice.status.toUpperCase()}
            </div>
            <div>
              <strong>Bill To:</strong><br>
              ${invoice.customerInfo ? `
                ${invoice.customerInfo.name}<br>
                ${invoice.customerInfo.email}<br>
                ${invoice.customerInfo.phone}
              ` : 'Walk-in Customer'}
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>${item.discount > 0 ? 
                    (item.discountType === 'percentage' ? `${item.discount}%` : `$${item.discount}`) : 
                    'None'}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> $${invoice.tax.toFixed(2)}</p>
            <p><strong>Discount:</strong> -$${invoice.discount.toFixed(2)}</p>
            <p><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
            <p><strong>Paid:</strong> $${invoice.paidAmount.toFixed(2)}</p>
            <p><strong>Balance:</strong> $${invoice.balance.toFixed(2)}</p>
          </div>
          
          <div class="footer">
            <p>${t.footer.thankYouMessage}</p>
            <p>${t.footer.paymentTerms}</p>
          </div>
        </body>
      </html>
    `;
  }

  // Get template by ID
  getTemplate(templateId: string): InvoiceTemplate | null {
    return this.templates().find((template: InvoiceTemplate) => template.id === templateId) || null;
  }

  // Update template
  updateTemplate(templateId: string, updates: Partial<InvoiceTemplate>): InvoiceTemplate | null {
    const templates = this.templates();
    const index = templates.findIndex((template: InvoiceTemplate) => template.id === templateId);
    
    if (index === -1) return null;

    const updatedTemplate = {
      ...templates[index],
      ...updates
    };

    this.templates.update((template: InvoiceTemplate[]) => [
      ...template.slice(0, index),
      updatedTemplate,
      ...template.slice(index + 1)
    ]);

    return updatedTemplate;
  }

  private initializeTemplates(): void {
    const defaultTemplate: InvoiceTemplate = {
      id: uuid(),
      name: 'Standard Invoice',
      type: 'standard',
      header: {
        companyName: 'Modern POS System',
        address: '123 Business Street, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@modernpos.com',
        website: 'www.modernpos.com',
        taxId: 'TX-123456789'
      },
      footer: {
        paymentTerms: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
        thankYouMessage: 'Thank you for your business!'
      }
    };

    this.templates.set([defaultTemplate]);
  }

  private loadMockInvoices(): void {
    // Mock data would be loaded here
  }
}
