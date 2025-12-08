import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData, ChartService } from '../../services/chart.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-advanced-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './advanced-reports.component.html',
  styleUrl: './advanced-reports.component.scss'
})
export class AdvancedReportsComponent implements OnInit {
  selectedReportType = 'sales';
  dateRange = '30'; // days
  
  // Chart data
  salesTrendData: ChartData | null = null;
  categoryPerformanceData: ChartData | null = null;
  topProductsData: ChartData | null = null;
  customerSegmentationData: ChartData | null = null;
  employeePerformanceData: ChartData | null = null;
  expenseAnalysisData: ChartData | null = null;
  budgetVsActualData: ChartData | null = null;
  hourlySalesData: ChartData | null = null;
  paymentMethodsData: ChartData | null = null;
  
  // Summary data
  dashboardSummary: any = {};
  
  // Loading states
  loading = true;
  
  constructor(private chartService: ChartService) {}

  ngOnInit() {
    this.loadAllChartData();
    this.loadDashboardSummary();
  }

  loadAllChartData() {
    this.loading = true;
    
    // Load all chart data
    this.salesTrendData = this.chartService.getSalesTrendChartData(parseInt(this.dateRange));
    this.categoryPerformanceData = this.chartService.getCategoryPerformanceChartData();
    this.topProductsData = this.chartService.getTopProductsChartData();
    this.customerSegmentationData = this.chartService.getCustomerSegmentationChartData();
    this.employeePerformanceData = this.chartService.getEmployeePerformanceChartData();
    this.expenseAnalysisData = this.chartService.getExpenseAnalysisChartData();
    this.budgetVsActualData = this.chartService.getBudgetVsActualChartData();
    this.hourlySalesData = this.chartService.getHourlySalesChartData();
    this.paymentMethodsData = this.chartService.getPaymentMethodsChartData();
    
    this.loading = false;
  }

  loadDashboardSummary() {
    this.dashboardSummary = this.chartService.getDashboardSummary();
  }

  onDateRangeChange() {
    this.salesTrendData = this.chartService.getSalesTrendChartData(parseInt(this.dateRange));
  }

  onReportTypeChange() {
    // This could be used to load different report types
    this.loadAllChartData();
  }

  exportReport() {
    // Export functionality
    const reportData = {
      reportType: this.selectedReportType,
      dateRange: this.dateRange,
      summary: this.dashboardSummary,
      generatedAt: new Date()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${this.selectedReportType}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  printReport() {
    window.print();
  }

  // Utility methods
  formatCurrency(value: number): string {
    return this.chartService.formatCurrency(value);
  }

  formatPercentage(value: number): string {
    return this.chartService.formatPercentage(value);
  }

  getChartOptions(type: string): any {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#fff'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#9CA3AF' },
          grid: { color: '#374151' }
        },
        y: {
          ticks: { color: '#9CA3AF' },
          grid: { color: '#374151' }
        }
      }
    };

    // Adjust for pie/doughnut charts
    if (type === 'pie' || type === 'doughnut') {
      const { scales, ...optionsWithoutScales } = baseOptions;
      return optionsWithoutScales;
    }

    return baseOptions;
  }

  getReportTypes() {
    return [
      { value: 'sales', label: 'Sales Analytics' },
      { value: 'products', label: 'Product Performance' },
      { value: 'customers', label: 'Customer Analytics' },
      { value: 'employees', label: 'Employee Performance' },
      { value: 'expenses', label: 'Expense Analysis' },
      { value: 'inventory', label: 'Inventory Reports' }
    ];
  }

  getDateRanges() {
    return [
      { value: '7', label: 'Last 7 Days' },
      { value: '30', label: 'Last 30 Days' },
      { value: '90', label: 'Last 90 Days' },
      { value: '365', label: 'Last Year' }
    ];
  }
}
