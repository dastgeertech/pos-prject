import { Injectable, signal, computed } from '@angular/core';
import { Transaction, Cart } from '../models/cart.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private receipts = signal<any[]>([]);
  
  receipts$ = computed(() => this.receipts());

  generateReceipt(transaction: Transaction, cart: Cart, customer?: Customer): string {
    const receipt = this.createReceiptContent(transaction, cart, customer);
    this.saveReceipt(receipt, transaction.id);
    return receipt;
  }

  private createReceiptContent(transaction: Transaction, cart: Cart, customer?: Customer): string {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let receipt = '';
    
    // Header
    receipt += '='.repeat(42) + '\n';
    receipt += '           MODERN POS SYSTEM\n';
    receipt += '           Point of Sale\n';
    receipt += '='.repeat(42) + '\n\n';
    
    // Date and Transaction Info
    receipt += `Date: ${formattedDate}\n`;
    receipt += `Transaction ID: ${transaction.id}\n`;
    receipt += `Cashier: ${transaction.cashier}\n`;
    receipt += `Payment: ${transaction.paymentMethod}\n\n`;
    
    // Customer Info (if available)
    if (customer) {
      receipt += 'Customer Information:\n';
      receipt += `Name: ${customer.name}\n`;
      if (customer.email) receipt += `Email: ${customer.email}\n`;
      if (customer.phone) receipt += `Phone: ${customer.phone}\n`;
      receipt += '\n';
    }
    
    // Items Header
    receipt += '-'.repeat(42) + '\n';
    receipt += 'ITEM'.padEnd(20) + 'QTY'.padEnd(8) + 'TOTAL\n';
    receipt += '-'.repeat(42) + '\n';
    
    // Items
    cart.items.forEach(item => {
      const itemName = item.product.name.length > 20 
        ? item.product.name.substring(0, 17) + '...'
        : item.product.name;
      
      receipt += itemName.padEnd(20);
      receipt += item.quantity.toString().padEnd(8);
      receipt += this.formatCurrency(item.total).padStart(10) + '\n';
      
      // Show discount if any
      if (item.discount > 0) {
        const discountText = item.discountType === 'percentage' 
          ? `${item.discount}% off`
          : `${this.formatCurrency(item.discount)} off`;
        receipt += `  (${discountText})\n`;
      }
    });
    
    // Totals
    receipt += '-'.repeat(42) + '\n';
    receipt += 'SUBTOTAL:'.padEnd(32) + this.formatCurrency(cart.subtotal).padStart(10) + '\n';
    
    if (cart.discount > 0) {
      const discountText = cart.discountType === 'percentage' 
        ? `Discount (${cart.discount}%)`
        : 'Discount';
      receipt += discountText.padEnd(32) + `-${this.formatCurrency(cart.discount)}`.padStart(10) + '\n';
    }
    
    receipt += 'TAX:'.padEnd(32) + this.formatCurrency(cart.tax).padStart(10) + '\n';
    receipt += '='.repeat(42) + '\n';
    receipt += 'TOTAL:'.padEnd(32) + this.formatCurrency(cart.total).padStart(10) + '\n';
    receipt += '='.repeat(42) + '\n\n';
    
    // Payment Details
    receipt += 'Payment Details:\n';
    receipt += `Amount Paid: ${this.formatCurrency(transaction.amount)}\n`;
    receipt += `Change: ${this.formatCurrency(transaction.change || 0)}\n\n`;
    
    // Loyalty Points (if customer)
    if (customer) {
      receipt += 'Loyalty Program:\n';
      receipt += `Points Earned: ${Math.floor(cart.total)}\n`;
      receipt += `Current Balance: ${customer.loyaltyPoints}\n\n`;
    }
    
    // Footer
    receipt += 'Thank you for your purchase!\n';
    receipt += 'Please come again soon!\n\n';
    receipt += 'Return Policy:\n';
    receipt += 'Items can be returned within 30 days\n';
    receipt += 'with original receipt.\n\n';
    receipt += '='.repeat(42) + '\n';
    receipt += 'Visit our website: www.modernpos.com\n';
    receipt += 'Call us: (555) 123-4567\n';
    receipt += '='.repeat(42) + '\n';
    
    return receipt;
  }

  printReceipt(transaction: Transaction, cart: Cart, customer?: Customer): void {
    const receipt = this.generateReceipt(transaction, cart, customer);
    
    // For demo purposes, we'll open in a new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                white-space: pre; 
                padding: 20px;
              }
              @media print {
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body>${receipt}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  downloadReceipt(transaction: Transaction, cart: Cart, customer?: Customer): void {
    const receipt = this.generateReceipt(transaction, cart, customer);
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  emailReceipt(transaction: Transaction, cart: Cart, customer?: Customer): void {
    if (!customer?.email) {
      alert('Customer email not available');
      return;
    }

    const receipt = this.generateReceipt(transaction, cart, customer);
    const subject = `Receipt for Transaction ${transaction.id}`;
    const body = `Dear ${customer.name},\n\nThank you for your purchase!\n\n${receipt}`;

    // Create mailto link
    const mailtoLink = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  }

  private saveReceipt(receipt: string, transactionId: string): void {
    const savedReceipt = {
      id: transactionId,
      content: receipt,
      createdAt: new Date()
    };
    
    this.receipts.update(receipts => [...receipts, savedReceipt]);
  }

  getReceiptHistory(): any[] {
    return this.receipts();
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}
