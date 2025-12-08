import { Injectable, signal, computed } from '@angular/core';
import { Employee, EmployeeSchedule, TimeClockEntry, Payroll } from '../models/employee.model';
import { v4 as uuid } from 'uuid';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'inventory' | 'employees' | 'reports' | 'settings' | 'customers';
  level: 'read' | 'write' | 'delete' | 'admin';
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  level: number; // Higher number = more senior
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  breakDuration: number; // in minutes
  requiredSkills: string[];
  maxEmployees: number;
  minEmployees: number;
  payRateMultiplier: number;
  isActive: boolean;
}

export interface ScheduleConflict {
  id: string;
  employeeId: string;
  type: 'double_booking' | 'short_notice' | 'unapproved_absence' | 'coverage_gap';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'bereavement' | 'jury_duty' | 'maternity' | 'paternity';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  reason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  deniedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewType: 'quarterly' | 'semi_annual' | 'annual' | 'probation' | 'special';
  reviewDate: Date;
  reviewerId: string;
  reviewerName: string;
  overallRating: number; // 1-5
  categories: {
    productivity: number;
    quality: number;
    teamwork: number;
    attendance: number;
    customer_service: number;
  };
  strengths: string[];
  areas_for_improvement: string[];
  goals: Array<{
    description: string;
    dueDate: Date;
    completed: boolean;
  }>;
  comments: string;
  employeeAcknowledged: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingRecord {
  id: string;
  employeeId: string;
  trainingType: string;
  trainingName: string;
  completionDate: Date;
  expiryDate?: Date;
  status: 'completed' | 'in_progress' | 'expired' | 'required';
  certificateUrl?: string;
  score?: number;
  instructor?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceAlert {
  id: string;
  employeeId: string;
  type: 'late_arrival' | 'early_departure' | 'no_show' | 'excessive_absences' | 'pattern_detected';
  date: Date;
  details: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface PayrollSettings {
  id: string;
  payFrequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  payDay: number; // Day of month or week
  overtimeThreshold: number; // Hours per week
  overtimeRate: number; // Multiplier
  holidayPayRate: number; // Multiplier
  sickAccrualRate: number; // Hours per pay period
  vacationAccrualRate: number; // Hours per pay period
  maxSickHours: number;
  maxVacationHours: number;
  taxSettings: {
    federalTax: number;
    stateTax: number;
    localTax: number;
    socialSecurity: number;
    medicare: number;
  };
  deductionTypes: Array<{
    id: string;
    name: string;
    type: 'percentage' | 'fixed';
    amount: number;
    isActive: boolean;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees = signal<Employee[]>([]);
  private schedules = signal<EmployeeSchedule[]>([]);
  private timeClockEntries = signal<TimeClockEntry[]>([]);
  private payrolls = signal<Payroll[]>([]);
  private permissions = signal<Permission[]>([]);
  private roles = signal<Role[]>([]);
  private shiftTemplates = signal<ShiftTemplate[]>([]);
  private scheduleConflicts = signal<ScheduleConflict[]>([]);
  private timeOffRequests = signal<TimeOffRequest[]>([]);
  private performanceReviews = signal<PerformanceReview[]>([]);
  private trainingRecords = signal<TrainingRecord[]>([]);
  private attendanceAlerts = signal<AttendanceAlert[]>([]);
  private payrollSettings = signal<PayrollSettings | null>(null);

  // Computed signals
  employees$ = computed(() => this.employees());
  schedules$ = computed(() => this.schedules());
  timeClockEntries$ = computed(() => this.timeClockEntries());
  payrolls$ = computed(() => this.payrolls());
  permissions$ = computed(() => this.permissions());
  roles$ = computed(() => this.roles());
  shiftTemplates$ = computed(() => this.shiftTemplates());
  scheduleConflicts$ = computed(() => this.scheduleConflicts());
  timeOffRequests$ = computed(() => this.timeOffRequests());
  performanceReviews$ = computed(() => this.performanceReviews());
  trainingRecords$ = computed(() => this.trainingRecords());
  attendanceAlerts$ = computed(() => this.attendanceAlerts());
  payrollSettings$ = computed(() => this.payrollSettings());

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock employees
    const mockEmployees: Employee[] = [
      {
        id: uuid(),
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@pos.com',
        phone: '555-0101',
        position: 'manager',
        department: 'Management',
        hireDate: new Date('2022-01-15'),
        salary: 55000,
        hourlyRate: 26.44,
        status: 'active',
        permissions: ['manage_inventory', 'manage_employees', 'view_reports', 'process_returns'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '555-0102'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@pos.com',
        phone: '555-0103',
        position: 'cashier',
        department: 'Sales',
        hireDate: new Date('2023-03-20'),
        salary: 32000,
        hourlyRate: 15.38,
        status: 'active',
        permissions: ['process_sales', 'view_customers'],
        address: {
          street: '456 Oak Ave',
          city: 'Brooklyn',
          state: 'NY',
          zipCode: '11201'
        },
        emergencyContact: {
          name: 'Mike Johnson',
          relationship: 'Brother',
          phone: '555-0104'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@pos.com',
        phone: '555-0105',
        position: 'stock',
        department: 'Warehouse',
        hireDate: new Date('2022-11-10'),
        salary: 35000,
        hourlyRate: 16.83,
        status: 'active',
        permissions: ['manage_inventory', 'receive_shipments'],
        address: {
          street: '789 Pine Rd',
          city: 'Queens',
          state: 'NY',
          zipCode: '11301'
        },
        emergencyContact: {
          name: 'Lisa Wilson',
          relationship: 'Spouse',
          phone: '555-0106'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.employees.set(mockEmployees);

    // Mock schedules
    const mockSchedules: EmployeeSchedule[] = [
      {
        id: uuid(),
        employeeId: mockEmployees[0].id,
        date: new Date(),
        startTime: '09:00',
        endTime: '17:00',
        shiftType: 'morning',
        status: 'completed'
      },
      {
        id: uuid(),
        employeeId: mockEmployees[1].id,
        date: new Date(),
        startTime: '13:00',
        endTime: '21:00',
        shiftType: 'afternoon',
        status: 'completed'
      },
      {
        id: uuid(),
        employeeId: mockEmployees[2].id,
        date: new Date(),
        startTime: '08:00',
        endTime: '16:00',
        shiftType: 'morning',
        status: 'completed'
      }
    ];

    this.schedules.set(mockSchedules);

    // Mock time clock entries
    const mockTimeClock: TimeClockEntry[] = [
      {
        id: uuid(),
        employeeId: mockEmployees[0].id,
        clockIn: new Date(new Date().setHours(8, 55, 0)),
        clockOut: new Date(new Date().setHours(17, 5, 0)),
        breakStart: new Date(new Date().setHours(12, 30, 0)),
        breakEnd: new Date(new Date().setHours(13, 0, 0)),
        totalHours: 8.17,
        overtimeHours: 0.17,
        status: 'completed'
      },
      {
        id: uuid(),
        employeeId: mockEmployees[1].id,
        clockIn: new Date(new Date().setHours(12, 58, 0)),
        clockOut: new Date(new Date().setHours(21, 2, 0)),
        breakStart: new Date(new Date().setHours(16, 30, 0)),
        breakEnd: new Date(new Date().setHours(17, 0, 0)),
        totalHours: 8.07,
        overtimeHours: 0,
        status: 'completed'
      }
    ];

    this.timeClockEntries.set(mockTimeClock);
  }

  // Employee CRUD operations
  getEmployees(): Employee[] {
    return this.employees();
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employees().find(emp => emp.id === id);
  }

  addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.employees.update(employees => [...employees, newEmployee]);
    return newEmployee;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
    const employee = this.getEmployeeById(id);
    if (!employee) return undefined;

    const updatedEmployee = { ...employee, ...updates, updatedAt: new Date() };
    this.employees.update(employees => 
      employees.map(emp => emp.id === id ? updatedEmployee : emp)
    );
    
    return updatedEmployee;
  }

  deleteEmployee(id: string): boolean {
    const employee = this.getEmployeeById(id);
    if (!employee) return false;

    this.employees.update(employees => employees.filter(emp => emp.id !== id));
    return true;
  }

  searchEmployees(query: string): Employee[] {
    const lowerQuery = query.toLowerCase();
    return this.employees().filter(emp => 
      emp.firstName.toLowerCase().includes(lowerQuery) ||
      emp.lastName.toLowerCase().includes(lowerQuery) ||
      emp.email.toLowerCase().includes(lowerQuery) ||
      emp.position.toLowerCase().includes(lowerQuery)
    );
  }

  // Schedule operations
  getSchedules(): EmployeeSchedule[] {
    return this.schedules();
  }

  getSchedulesByEmployee(employeeId: string): EmployeeSchedule[] {
    return this.schedules().filter(schedule => schedule.employeeId === employeeId);
  }

  addSchedule(schedule: Omit<EmployeeSchedule, 'id'>): EmployeeSchedule {
    const newSchedule: EmployeeSchedule = {
      ...schedule,
      id: uuid()
    };
    
    this.schedules.update(schedules => [...schedules, newSchedule]);
    return newSchedule;
  }

  updateSchedule(id: string, updates: Partial<EmployeeSchedule>): EmployeeSchedule | undefined {
    const schedule = this.schedules().find(s => s.id === id);
    if (!schedule) return undefined;

    const updatedSchedule = { ...schedule, ...updates };
    this.schedules.update(schedules => 
      schedules.map(s => s.id === id ? updatedSchedule : s)
    );
    
    return updatedSchedule;
  }

  // Time Clock operations
  clockIn(employeeId: string): TimeClockEntry {
    const entry: TimeClockEntry = {
      id: uuid(),
      employeeId,
      clockIn: new Date(),
      status: 'active'
    };
    
    this.timeClockEntries.update(entries => [...entries, entry]);
    return entry;
  }

  clockOut(entryId: string): TimeClockEntry | undefined {
    const entry = this.timeClockEntries().find(e => e.id === entryId);
    if (!entry || entry.status !== 'active') return undefined;

    const updatedEntry = {
      ...entry,
      clockOut: new Date(),
      status: 'completed' as const,
      totalHours: this.calculateHours(entry.clockIn, new Date(), entry.breakStart, entry.breakEnd),
      overtimeHours: 0
    };

    // Calculate overtime (over 8 hours)
    if (updatedEntry.totalHours && updatedEntry.totalHours > 8) {
      updatedEntry.overtimeHours = updatedEntry.totalHours - 8;
    }

    this.timeClockEntries.update(entries => 
      entries.map(e => e.id === entryId ? updatedEntry : e)
    );

    return updatedEntry;
  }

  startBreak(entryId: string): TimeClockEntry | undefined {
    const entry = this.timeClockEntries().find(e => e.id === entryId);
    if (!entry || entry.status !== 'active') return undefined;

    const updatedEntry = { ...entry, breakStart: new Date() };
    this.timeClockEntries.update(entries => 
      entries.map(e => e.id === entryId ? updatedEntry : e)
    );

    return updatedEntry;
  }

  endBreak(entryId: string): TimeClockEntry | undefined {
    const entry = this.timeClockEntries().find(e => e.id === entryId);
    if (!entry || !entry.breakStart) return undefined;

    const updatedEntry = { ...entry, breakEnd: new Date() };
    this.timeClockEntries.update(entries => 
      entries.map(e => e.id === entryId ? updatedEntry : e)
    );

    return updatedEntry;
  }

  getActiveTimeClockEntry(employeeId: string): TimeClockEntry | undefined {
    return this.timeClockEntries().find(entry => 
      entry.employeeId === employeeId && entry.status === 'active'
    );
  }

  private calculateHours(clockIn: Date, clockOut: Date, breakStart?: Date, breakEnd?: Date): number {
    let totalMs = clockOut.getTime() - clockIn.getTime();
    
    if (breakStart && breakEnd) {
      totalMs -= (breakEnd.getTime() - breakStart.getTime());
    }
    
    return Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100;
  }

  // Payroll operations
  generatePayroll(employeeId: string, startDate: Date, endDate: Date): Payroll {
    const employee = this.getEmployeeById(employeeId);
    if (!employee) throw new Error('Employee not found');

    const timeEntries = this.timeClockEntries().filter(entry => 
      entry.employeeId === employeeId &&
      entry.clockIn >= startDate &&
      entry.clockIn! <= endDate &&
      entry.status === 'completed'
    );

    const regularHours = timeEntries.reduce((sum, entry) => {
      const hours = entry.totalHours || 0;
      return sum + (hours > 8 ? 8 : hours);
    }, 0);

    const overtimeHours = timeEntries.reduce((sum, entry) => 
      sum + (entry.overtimeHours || 0), 0
    );

    const regularPay = regularHours * employee.hourlyRate;
    const overtimePay = overtimeHours * employee.hourlyRate * 1.5;
    const grossPay = regularPay + overtimePay;
    
    // Simple tax calculation (20%)
    const deductions = grossPay * 0.2;
    const netPay = grossPay - deductions;

    const payroll: Payroll = {
      id: uuid(),
      employeeId,
      payPeriod: { startDate, endDate },
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      deductions,
      bonuses: 0,
      netPay,
      status: 'pending',
      createdAt: new Date()
    };

    this.payrolls.update(payrolls => [...payrolls, payroll]);
    return payroll;
  }

  getPayrolls(): Payroll[] {
    return this.payrolls();
  }

  getPayrollsByEmployee(employeeId: string): Payroll[] {
    return this.payrolls().filter(payroll => payroll.employeeId === employeeId);
  }

  processPayroll(payrollId: string): Payroll | undefined {
    const payroll = this.payrolls().find(p => p.id === payrollId);
    if (!payroll) return undefined;

    const updatedPayroll = {
      ...payroll,
      status: 'processed' as const,
      paidDate: new Date()
    };

    this.payrolls.update(payrolls => 
      payrolls.map(p => p.id === payrollId ? updatedPayroll : p)
    );

    return updatedPayroll;
  }

  // Utility methods
  getActiveEmployees(): Employee[] {
    return this.employees().filter(emp => emp.status === 'active');
  }

  getEmployeesByPosition(position: string): Employee[] {
    return this.employees().filter(emp => emp.position === position);
  }

  getTodaySchedules(): EmployeeSchedule[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.schedules().filter(schedule => 
      schedule.date >= today && schedule.date < tomorrow
    );
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  // Enhanced Employee Management Methods

  // Permissions and Roles Management
  createPermission(permission: Omit<Permission, 'id'>): Permission {
    const newPermission: Permission = { id: uuid(), ...permission };
    this.permissions.update(permissions => [...permissions, newPermission]);
    return newPermission;
  }

  createRole(role: Omit<Role, 'id'>): Role {
    const newRole: Role = { id: uuid(), ...role };
    this.roles.update(roles => [...roles, newRole]);
    return newRole;
  }

  assignRoleToEmployee(employeeId: string, roleId: string): boolean {
    const employee = this.employees().find(e => e.id === employeeId);
    const role = this.roles().find(r => r.id === roleId);
    
    if (!employee || !role) return false;

    this.updateEmployee(employeeId, { permissions: role.permissions });
    return true;
  }

  hasPermission(employeeId: string, permissionName: string): boolean {
    const employee = this.employees().find(e => e.id === employeeId);
    if (!employee) return false;

    return employee.permissions.includes(permissionName);
  }

  // Shift Templates Management
  createShiftTemplate(template: Omit<ShiftTemplate, 'id'>): ShiftTemplate {
    const newTemplate: ShiftTemplate = { id: uuid(), ...template };
    this.shiftTemplates.update(templates => [...templates, newTemplate]);
    return newTemplate;
  }

  generateScheduleFromTemplate(
    templateId: string,
    employeeIds: string[],
    startDate: Date,
    endDate: Date
  ): EmployeeSchedule[] {
    const template = this.shiftTemplates().find(t => t.id === templateId);
    if (!template) return [];

    const schedules: EmployeeSchedule[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Skip weekends if not configured
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        for (const employeeId of employeeIds) {
          const schedule: EmployeeSchedule = {
            id: uuid(),
            employeeId,
            date: new Date(currentDate),
            startTime: template.startTime,
            endTime: template.endTime,
            shiftType: 'morning',
            status: 'scheduled',
            notes: `Generated from ${template.name} template`
          };
          schedules.push(schedule);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.schedules.update(currentSchedules => [...currentSchedules, ...schedules]);
    return schedules;
  }

  // Schedule Conflict Detection
  detectScheduleConflicts(date: Date): ScheduleConflict[] {
    const daySchedules = this.schedules().filter(s => 
      s.date.toDateString() === date.toDateString()
    );
    
    const conflicts: ScheduleConflict[] = [];

    // Check for double bookings
    const employeeSchedules = daySchedules.reduce((groups, schedule) => {
      groups[schedule.employeeId] = groups[schedule.employeeId] || [];
      groups[schedule.employeeId].push(schedule);
      return groups;
    }, {} as Record<string, EmployeeSchedule[]>);

    Object.entries(employeeSchedules).forEach(([employeeId, schedules]) => {
      if (schedules.length > 1) {
        conflicts.push({
          id: uuid(),
          employeeId,
          type: 'double_booking',
          description: `Employee has ${schedules.length} shifts scheduled`,
          severity: 'high',
          date,
          resolved: false
        });
      }
    });

    this.scheduleConflicts.update(currentConflicts => [...currentConflicts, ...conflicts]);
    return conflicts;
  }

  // Time Off Management
  submitTimeOffRequest(request: Omit<TimeOffRequest, 'id' | 'createdAt' | 'updatedAt'>): TimeOffRequest {
    const newRequest: TimeOffRequest = {
      id: uuid(),
      ...request,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.timeOffRequests.update(requests => [...requests, newRequest]);
    
    // Check for conflicts
    this.checkTimeOffConflicts(newRequest);
    
    return newRequest;
  }

  approveTimeOffRequest(requestId: string, approvedBy: string): boolean {
    const request = this.timeOffRequests().find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return false;

    const updatedRequest = {
      ...request,
      status: 'approved' as const,
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date()
    };

    this.timeOffRequests.update(requests => 
      requests.map(r => r.id === requestId ? updatedRequest : r)
    );

    // Update schedule to block off time
    this.blockScheduleForTimeOff(request.employeeId, request.startDate, request.endDate);
    
    return true;
  }

  // Performance Management
  createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>): PerformanceReview {
    const newReview: PerformanceReview = {
      id: uuid(),
      ...review,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.performanceReviews.update(reviews => [...reviews, newReview]);
    return newReview;
  }

  getEmployeePerformanceHistory(employeeId: string): PerformanceReview[] {
    return this.performanceReviews()
      .filter(review => review.employeeId === employeeId)
      .sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime());
  }

  // Training Management
  addTrainingRecord(record: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'>): TrainingRecord {
    const newRecord: TrainingRecord = {
      id: uuid(),
      ...record,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.trainingRecords.update(records => [...records, newRecord]);
    return newRecord;
  }

  getRequiredTraining(employeeId: string): TrainingRecord[] {
    return this.trainingRecords()
      .filter(record => 
        record.employeeId === employeeId && 
        record.status === 'required'
      );
  }

  getExpiredTraining(employeeId: string): TrainingRecord[] {
    const now = new Date();
    return this.trainingRecords()
      .filter(record => 
        record.employeeId === employeeId && 
        record.expiryDate && 
        record.expiryDate < now
      );
  }

  // Attendance Monitoring
  createAttendanceAlert(alert: Omit<AttendanceAlert, 'id' | 'createdAt'>): AttendanceAlert {
    const newAlert: AttendanceAlert = {
      id: uuid(),
      ...alert,
      createdAt: new Date()
    };

    this.attendanceAlerts.update(alerts => [...alerts, newAlert]);
    return newAlert;
  }

  getAttendanceAnalytics(employeeId: string, dateRange: { start: Date; end: Date }): {
    totalDays: number;
    daysWorked: number;
    daysAbsent: number;
    daysLate: number;
    averageHoursPerDay: number;
    overtimeHours: number;
  } {
    const entries = this.timeClockEntries()
      .filter(entry => 
        entry.employeeId === employeeId &&
        entry.clockIn >= dateRange.start &&
        entry.clockOut && entry.clockOut <= dateRange.end
      );

    const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const daysWorked = entries.length;
    const daysAbsent = totalDays - daysWorked;
    
    const lateArrivals = entries.filter(entry => {
      const scheduledStart = this.getScheduledStartTime(entry.employeeId, entry.clockIn);
      return scheduledStart && entry.clockIn > scheduledStart;
    });
    const daysLate = lateArrivals.length;

    const totalHours = entries.reduce((sum, entry) => {
      if (entry.clockOut) {
        return sum + (entry.clockOut.getTime() - entry.clockIn.getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    const averageHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;
    const overtimeHours = entries.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0);

    return {
      totalDays,
      daysWorked,
      daysAbsent,
      daysLate,
      averageHoursPerDay,
      overtimeHours
    };
  }

  // Payroll Settings
  updatePayrollSettings(settings: PayrollSettings): void {
    this.payrollSettings.set(settings);
  }

  // Helper Methods
  private checkTimeOffConflicts(request: TimeOffRequest): void {
    const conflictingSchedules = this.schedules().filter(schedule =>
      schedule.employeeId === request.employeeId &&
      schedule.date >= request.startDate &&
      schedule.date <= request.endDate &&
      schedule.status === 'scheduled'
    );

    if (conflictingSchedules.length > 0) {
      this.createAttendanceAlert({
        employeeId: request.employeeId,
        type: 'pattern_detected',
        date: request.startDate,
        details: `Time off request conflicts with ${conflictingSchedules.length} scheduled shifts`,
        severity: 'medium',
        resolved: false
      });
    }
  }

  private blockScheduleForTimeOff(employeeId: string, startDate: Date, endDate: Date): void {
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const existingSchedule = this.schedules().find(s =>
        s.employeeId === employeeId &&
        s.date.toDateString() === currentDate.toDateString()
      );

      if (existingSchedule) {
        this.updateSchedule(existingSchedule.id, { status: 'absent' });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private getScheduledStartTime(employeeId: string, date: Date): Date | null {
    const schedule = this.schedules().find(s =>
      s.employeeId === employeeId &&
      s.date.toDateString() === date.toDateString()
    );

    if (schedule && schedule.startTime) {
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      return startTime;
    }

    return null;
  }

  private initializeEnhancedData(): void {
    // Initialize permissions
    const defaultPermissions: Permission[] = [
      { id: uuid(), name: 'view_sales', description: 'View sales reports', category: 'sales', level: 'read', isActive: true },
      { id: uuid(), name: 'process_sales', description: 'Process sales transactions', category: 'sales', level: 'write', isActive: true },
      { id: uuid(), name: 'manage_inventory', description: 'Manage inventory', category: 'inventory', level: 'write', isActive: true },
      { id: uuid(), name: 'view_reports', description: 'View business reports', category: 'reports', level: 'read', isActive: true },
      { id: uuid(), name: 'manage_employees', description: 'Manage employee records', category: 'employees', level: 'admin', isActive: true }
    ];
    this.permissions.set(defaultPermissions);

    // Initialize roles
    const defaultRoles: Role[] = [
      {
        id: uuid(),
        name: 'Cashier',
        description: 'Basic sales operations',
        permissions: ['view_sales', 'process_sales'],
        isActive: true,
        level: 1
      },
      {
        id: uuid(),
        name: 'Manager',
        description: 'Store management',
        permissions: ['view_sales', 'process_sales', 'manage_inventory', 'view_reports'],
        isActive: true,
        level: 2
      },
      {
        id: uuid(),
        name: 'Administrator',
        description: 'Full system access',
        permissions: ['view_sales', 'process_sales', 'manage_inventory', 'view_reports', 'manage_employees'],
        isActive: true,
        level: 3
      }
    ];
    this.roles.set(defaultRoles);

    // Initialize shift templates
    const defaultShiftTemplates: ShiftTemplate[] = [
      {
        id: uuid(),
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '16:00',
        duration: 8,
        breakDuration: 30,
        requiredSkills: ['customer_service'],
        maxEmployees: 3,
        minEmployees: 2,
        payRateMultiplier: 1,
        isActive: true
      },
      {
        id: uuid(),
        name: 'Evening Shift',
        startTime: '16:00',
        endTime: '24:00',
        duration: 8,
        breakDuration: 30,
        requiredSkills: ['customer_service'],
        maxEmployees: 2,
        minEmployees: 1,
        payRateMultiplier: 1.1,
        isActive: true
      }
    ];
    this.shiftTemplates.set(defaultShiftTemplates);

    // Initialize payroll settings
    const defaultPayrollSettings: PayrollSettings = {
      id: uuid(),
      payFrequency: 'bi_weekly',
      payDay: 5,
      overtimeThreshold: 40,
      overtimeRate: 1.5,
      holidayPayRate: 1.5,
      sickAccrualRate: 4,
      vacationAccrualRate: 8,
      maxSickHours: 80,
      maxVacationHours: 160,
      taxSettings: {
        federalTax: 0.15,
        stateTax: 0.05,
        localTax: 0.02,
        socialSecurity: 0.062,
        medicare: 0.0145
      },
      deductionTypes: [
        { id: uuid(), name: 'Health Insurance', type: 'percentage', amount: 0.03, isActive: true },
        { id: uuid(), name: '401k', type: 'percentage', amount: 0.05, isActive: true }
      ]
    };
    this.payrollSettings.set(defaultPayrollSettings);
  }
}
