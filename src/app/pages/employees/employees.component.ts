import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Permission, Role, TimeOffRequest, PerformanceReview, TrainingRecord } from '../../services/employee.service';
import { Employee, EmployeeSchedule, TimeClockEntry, Payroll } from '../../models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  // Tab management
  activeTab = signal<'employees' | 'schedules' | 'timeoff' | 'performance' | 'training' | 'payroll'>('employees');
  
  // Data signals
  employees = signal<Employee[]>([]);
  filteredEmployees = computed(() => {
    const searchTerm = this.searchTerm().toLowerCase();
    const statusFilter = this.statusFilter();
    const positionFilter = this.positionFilter();
    
    return this.employees().filter(employee => {
      const matchesSearch = 
        employee.firstName.toLowerCase().includes(searchTerm) ||
        employee.lastName.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm) ||
        employee.position.toLowerCase().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      const matchesPosition = positionFilter === 'all' || employee.position === positionFilter;
      
      return matchesSearch && matchesStatus && matchesPosition;
    });
  });
  
  schedules = signal<EmployeeSchedule[]>([]);
  timeOffRequests = signal<TimeOffRequest[]>([]);
  performanceReviews = signal<PerformanceReview[]>([]);
  trainingRecords = signal<TrainingRecord[]>([]);
  payrolls = signal<Payroll[]>([]);
  
  // Filter and search
  searchTerm = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive' | 'onLeave'>('all');
  positionFilter = signal<'all' | 'cashier' | 'manager' | 'supervisor' | 'stock' | 'admin'>('all');
  dateRange = signal<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  
  // Modal states
  showEmployeeModal = signal(false);
  showScheduleModal = signal(false);
  showTimeOffModal = signal(false);
  showPerformanceModal = signal(false);
  showTrainingModal = signal(false);
  showPayrollModal = signal(false);
  
  // Form data
  selectedEmployee = signal<Employee | null>(null);
  selectedSchedule = signal<EmployeeSchedule | null>(null);
  selectedTimeOff = signal<TimeOffRequest | null>(null);
  selectedPerformance = signal<PerformanceReview | null>(null);
  selectedTraining = signal<TrainingRecord | null>(null);
  selectedPayroll = signal<Payroll | null>(null);
  
  // New form data
  newEmployee: Partial<Employee> = {
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  };
  newSchedule: Partial<EmployeeSchedule> = {};
  newTimeOff: Partial<TimeOffRequest> = {};
  newPerformance: Partial<PerformanceReview> = {};
  newTraining: Partial<TrainingRecord> = {};
  newPayroll: Partial<Payroll> = {};
  
  // Statistics
  employeeStats = computed(() => {
    const employees = this.employees();
    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      onLeave: employees.filter(e => e.status === 'onLeave').length,
      inactive: employees.filter(e => e.status === 'inactive').length
    };
  });

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.employees.set(this.employeeService.employees$());
    this.schedules.set(this.employeeService.schedules$());
    this.timeOffRequests.set(this.employeeService.timeOffRequests$());
    this.performanceReviews.set(this.employeeService.performanceReviews$());
    this.trainingRecords.set(this.employeeService.trainingRecords$());
    this.payrolls.set(this.employeeService.payrolls$());
  }

  // Employee CRUD operations
  addEmployee() {
    if (this.newEmployee.firstName && this.newEmployee.lastName && this.newEmployee.email) {
      const employee = this.employeeService.addEmployee({
        firstName: this.newEmployee.firstName!,
        lastName: this.newEmployee.lastName!,
        email: this.newEmployee.email!,
        phone: this.newEmployee.phone || '',
        position: this.newEmployee.position as any || 'cashier',
        department: this.newEmployee.department || 'Sales',
        hireDate: this.newEmployee.hireDate || new Date(),
        salary: this.newEmployee.salary || 0,
        hourlyRate: this.newEmployee.hourlyRate || 0,
        status: 'active',
        permissions: [],
        address: {
          street: this.newEmployee.address?.street || '',
          city: this.newEmployee.address?.city || '',
          state: this.newEmployee.address?.state || '',
          zipCode: this.newEmployee.address?.zipCode || ''
        },
        emergencyContact: {
          name: this.newEmployee.emergencyContact?.name || '',
          relationship: this.newEmployee.emergencyContact?.relationship || '',
          phone: this.newEmployee.emergencyContact?.phone || ''
        }
      });
      
      this.employees.set(this.employeeService.getEmployees());
      this.resetForm('employee');
      this.showEmployeeModal.set(false);
    }
  }

  updateEmployee() {
    const employee = this.selectedEmployee();
    if (employee && this.newEmployee.firstName && this.newEmployee.lastName) {
      this.employeeService.updateEmployee(employee.id, {
        firstName: this.newEmployee.firstName,
        lastName: this.newEmployee.lastName,
        email: this.newEmployee.email,
        phone: this.newEmployee.phone,
        position: this.newEmployee.position as any,
        department: this.newEmployee.department,
        salary: this.newEmployee.salary,
        hourlyRate: this.newEmployee.hourlyRate,
        status: this.newEmployee.status as any,
        address: this.newEmployee.address,
        emergencyContact: this.newEmployee.emergencyContact
      });
      
      this.employees.set(this.employeeService.getEmployees());
      this.resetForm('employee');
      this.showEmployeeModal.set(false);
    }
  }

  deleteEmployee(employee: Employee) {
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      this.employeeService.deleteEmployee(employee.id);
      this.employees.set(this.employeeService.getEmployees());
    }
  }

  // Modal handlers
  openEmployeeModal(employee?: Employee) {
    if (employee) {
      this.selectedEmployee.set(employee);
      this.newEmployee = { 
        ...employee,
        address: {
          street: employee.address?.street || '',
          city: employee.address?.city || '',
          state: employee.address?.state || '',
          zipCode: employee.address?.zipCode || ''
        },
        emergencyContact: {
          name: employee.emergencyContact?.name || '',
          relationship: employee.emergencyContact?.relationship || '',
          phone: employee.emergencyContact?.phone || ''
        }
      };
    } else {
      this.selectedEmployee.set(null);
      this.newEmployee = {
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        }
      };
    }
    this.showEmployeeModal.set(true);
  }

  closeModal() {
    this.showEmployeeModal.set(false);
    this.showScheduleModal.set(false);
    this.showTimeOffModal.set(false);
    this.showPerformanceModal.set(false);
    this.showTrainingModal.set(false);
    this.showPayrollModal.set(false);
    this.resetAllForms();
  }

  resetForm(formType: string) {
    switch (formType) {
      case 'employee':
        this.newEmployee = {
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    };
        this.selectedEmployee.set(null);
        break;
      case 'schedule':
        this.newSchedule = {};
        this.selectedSchedule.set(null);
        break;
      case 'timeoff':
        this.newTimeOff = {};
        this.selectedTimeOff.set(null);
        break;
      case 'performance':
        this.newPerformance = {};
        this.selectedPerformance.set(null);
        break;
      case 'training':
        this.newTraining = {};
        this.selectedTraining.set(null);
        break;
      case 'payroll':
        this.newPayroll = {};
        this.selectedPayroll.set(null);
        break;
    }
  }

  resetAllForms() {
    this.newEmployee = {
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    };
    this.newSchedule = {};
    this.newTimeOff = {};
    this.newPerformance = {};
    this.newTraining = {};
    this.newPayroll = {};
    this.selectedEmployee.set(null);
    this.selectedSchedule.set(null);
    this.selectedTimeOff.set(null);
    this.selectedPerformance.set(null);
    this.selectedTraining.set(null);
    this.selectedPayroll.set(null);
  }

  onHireDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newEmployee.hireDate = new Date(target.value);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'onLeave': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  getPositionClass(position: string): string {
    switch (position) {
      case 'manager': return 'bg-purple-500';
      case 'supervisor': return 'bg-blue-500';
      case 'cashier': return 'bg-green-500';
      case 'stock': return 'bg-orange-500';
      case 'admin': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  }

  // Tab navigation
  setActiveTab(tab: 'employees' | 'schedules' | 'timeoff' | 'performance' | 'training' | 'payroll') {
    this.activeTab.set(tab);
  }

  // Filter handlers
  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  onStatusFilterChange(status: 'all' | 'active' | 'inactive' | 'onLeave') {
    this.statusFilter.set(status);
  }

  onPositionFilterChange(position: 'all' | 'cashier' | 'manager' | 'supervisor' | 'stock' | 'admin') {
    this.positionFilter.set(position);
  }

  onDateRangeChange(range: { start: Date | null; end: Date | null }) {
    this.dateRange.set(range);
  }
}