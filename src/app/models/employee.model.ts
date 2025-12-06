export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: 'cashier' | 'manager' | 'supervisor' | 'stock' | 'admin';
  department: string;
  hireDate: Date;
  salary: number;
  hourlyRate: number;
  status: 'active' | 'inactive' | 'onLeave';
  permissions: string[];
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  shiftType: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'scheduled' | 'completed' | 'absent' | 'late';
  notes?: string;
}

export interface TimeClockEntry {
  id: string;
  employeeId: string;
  clockIn: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours?: number;
  overtimeHours?: number;
  status: 'active' | 'completed';
  notes?: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  payPeriod: {
    startDate: Date;
    endDate: Date;
  };
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  deductions: number;
  bonuses: number;
  netPay: number;
  status: 'pending' | 'processed' | 'paid';
  paidDate?: Date;
  createdAt: Date;
}
