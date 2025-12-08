import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentTransaction, PaymentMethodType, PaymentProcessor } from '../../services/payment.service';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  transactions: PaymentTransaction[] = [];
  filteredTransactions: PaymentTransaction[] = [];
  paymentMethods: PaymentMethodType[] = [];
  processors: PaymentProcessor[] = [];
  customers: Customer[] = [];
  
  searchQuery: string = '';
  statusFilter: string = 'all';
  dateRange: { start: string; end: string } = { start: '', end: '' };
  
  selectedTransaction: PaymentTransaction | null = null;
  showRefundModal = false;
  refundAmount: number = 0;
  refundReason: string = '';

  constructor(
    private paymentService: PaymentService,
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.transactions = this.paymentService.transactions$();
    this.filteredTransactions = [...this.transactions];
    this.paymentMethods = this.paymentService.getAvailablePaymentMethods();
    this.processors = this.paymentService.processors$();
    this.customers = this.customerService.getCustomers();
  }

  filterTransactions() {
    let filtered = this.transactions;

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(query) ||
        t.transactionId?.toLowerCase().includes(query) ||
        t.authorizationCode?.toLowerCase().includes(query) ||
        t.paymentMethod.type.toLowerCase().includes(query) ||
        t.processor.name.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === this.statusFilter);
    }

    // Filter by date range
    if (this.dateRange.start && this.dateRange.end) {
      const startDate = new Date(this.dateRange.start);
      const endDate = new Date(this.dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    this.filteredTransactions = filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getCustomerName(customerId?: string): string {
    if (!customerId) return 'Guest';
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'processing': return 'bg-blue-500/20 text-blue-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
      case 'refunded': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  openRefundModal(transaction: PaymentTransaction) {
    this.selectedTransaction = transaction;
    this.refundAmount = transaction.amount;
    this.refundReason = '';
    this.showRefundModal = true;
  }

  processRefund() {
    if (!this.selectedTransaction) return;
    
    // In a real implementation, this would call the payment service refund method
    alert(`Refund processed for ${this.formatCurrency(this.refundAmount)}`);
    
    this.closeRefundModal();
  }

  closeRefundModal() {
    this.showRefundModal = false;
    this.selectedTransaction = null;
    this.refundAmount = 0;
    this.refundReason = '';
  }

  getTotalAmount(transactions: PaymentTransaction[]): number {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  getTransactionStats() {
    const completed = this.transactions.filter(t => t.status === 'completed').length;
    const failed = this.transactions.filter(t => t.status === 'failed').length;
    const refunded = this.transactions.filter(t => t.status === 'refunded').length;
    const totalAmount = this.getTotalAmount(this.transactions.filter(t => t.status === 'completed'));

    return { completed, failed, refunded, totalAmount };
  }
}