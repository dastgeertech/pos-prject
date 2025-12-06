import { Injectable } from '@angular/core';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topCategory: string;
  growthRate: number;
  customerCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  
  constructor() {}

  // Sales trend data
  getSalesTrendChartData(days: number): ChartData {
    const labels = this.generateDateLabels(days);
    const data = labels.map(() => Math.floor(Math.random() * 10000) + 5000);
    
    return {
      labels,
      datasets: [{
        label: 'Sales Revenue',
        data,
        borderColor: '#3B82F6',
        backgroundColor: ['#3B82F6'],
        borderWidth: 2,
        fill: true
      }]
    };
  }

  // Category performance data
  getCategoryPerformanceChartData(): ChartData {
    return {
      labels: ['Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home'],
      datasets: [{
        label: 'Revenue by Category',
        data: [45000, 38000, 28000, 15000, 22000, 31000],
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
        ]
      }]
    };
  }

  // Top products data
  getTopProductsChartData(): ChartData {
    return {
      labels: ['Laptop', 'Phone', 'Headphones', 'Watch', 'Tablet'],
      datasets: [{
        label: 'Top Products Sales',
        data: [12000, 9800, 7600, 6500, 5400],
        backgroundColor: ['#10B981']
      }]
    };
  }

  // Customer segmentation data
  getCustomerSegmentationChartData(): ChartData {
    return {
      labels: ['New', 'Returning', 'VIP', 'Inactive'],
      datasets: [{
        label: 'Customer Segments',
        data: [150, 280, 95, 45],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
      }]
    };
  }

  // Employee performance data
  getEmployeePerformanceChartData(): ChartData {
    return {
      labels: ['John', 'Sarah', 'Mike', 'Emma', 'David'],
      datasets: [{
        label: 'Sales by Employee',
        data: [25000, 22000, 19000, 18000, 16000],
        backgroundColor: ['#8B5CF6']
      }]
    };
  }

  // Expense analysis data
  getExpenseAnalysisChartData(): ChartData {
    return {
      labels: ['Rent', 'Salaries', 'Marketing', 'Utilities', 'Supplies', 'Other'],
      datasets: [{
        label: 'Monthly Expenses',
        data: [8000, 12000, 3000, 1500, 2000, 1000],
        backgroundColor: ['#EF4444']
      }]
    };
  }

  // Budget vs actual data
  getBudgetVsActualChartData(): ChartData {
    return {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Budget',
          data: [50000, 55000, 52000, 58000],
          borderColor: '#3B82F6',
          backgroundColor: ['#3B82F6'],
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Actual',
          data: [48000, 57000, 51000, 59000],
          borderColor: '#10B981',
          backgroundColor: ['#10B981'],
          borderWidth: 2,
          fill: false
        }
      ]
    };
  }

  // Hourly sales data
  getHourlySalesChartData(): ChartData {
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    const data = hours.map((_, i) => {
      // Simulate realistic hourly sales pattern
      if (i < 6) return Math.floor(Math.random() * 500) + 100;
      if (i < 9) return Math.floor(Math.random() * 1000) + 500;
      if (i < 12) return Math.floor(Math.random() * 2000) + 1500;
      if (i < 14) return Math.floor(Math.random() * 1500) + 1000;
      if (i < 18) return Math.floor(Math.random() * 2500) + 2000;
      if (i < 21) return Math.floor(Math.random() * 2000) + 1500;
      return Math.floor(Math.random() * 800) + 400;
    });
    
    return {
      labels: hours,
      datasets: [{
        label: 'Hourly Sales',
        data,
        borderColor: '#F59E0B',
        backgroundColor: ['#F59E0B'],
        borderWidth: 2,
        fill: true
      }]
    };
  }

  // Payment methods data
  getPaymentMethodsChartData(): ChartData {
    return {
      labels: ['Credit Card', 'Cash', 'Debit Card', 'Mobile', 'Other'],
      datasets: [{
        label: 'Payment Methods',
        data: [45, 25, 20, 8, 2],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
      }]
    };
  }

  // Dashboard summary
  getDashboardSummary(): DashboardSummary {
    return {
      totalRevenue: 275000,
      totalOrders: 1450,
      averageOrderValue: 189.66,
      topCategory: 'Electronics',
      growthRate: 12.5,
      customerCount: 570
    };
  }

  // Utility methods
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  // Helper method to generate date labels
  private generateDateLabels(days: number): string[] {
    const labels: string[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return labels;
  }
}