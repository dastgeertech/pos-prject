import { Injectable, signal, computed } from '@angular/core';
import { v4 as uuid } from 'uuid';

export interface Location {
  id: string;
  name: string;
  code: string;
  type: 'store' | 'warehouse' | 'office' | 'distribution_center';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    manager: string;
  };
  operatingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  timezone: string;
  currency: string;
  taxRates: {
    salesTax: number;
    localTax: number;
    stateTax: number;
    federalTax: number;
  };
  settings: {
    allowOnlineOrders: boolean;
    allowInStorePickup: boolean;
    allowDelivery: boolean;
    deliveryRadius: number; // in miles
    inventoryTracking: boolean;
    employeeScheduling: boolean;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  openDate: Date;
  parentLocationId?: string;
  childLocationIds: string[];
  employees: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationTransfer {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  items: TransferItem[];
  initiatedBy: string;
  initiatedAt: Date;
  estimatedArrival?: Date;
  actualArrival?: Date;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  receivedBy?: string;
  receivedAt?: Date;
}

export interface TransferItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  serialNumbers?: string[];
  batchNumbers?: string[];
  expiryDates?: Date[];
}

export interface InventorySync {
  id: string;
  locationId: string;
  productId: string;
  systemQuantity: number;
  actualQuantity: number;
  variance: number;
  varianceValue: number;
  lastSyncDate: Date;
  syncType: 'full' | 'partial' | 'adjustment';
  syncedBy: string;
  notes?: string;
}

export interface LocationPerformance {
  locationId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  metrics: {
    revenue: number;
    transactions: number;
    averageTransactionValue: number;
    customers: number;
    newCustomers: number;
    returningCustomers: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      quantity: number;
      revenue: number;
    }>;
    employeePerformance: Array<{
      employeeId: string;
      employeeName: string;
      hoursWorked: number;
      sales: number;
      transactions: number;
    }>;
    inventoryTurnover: number;
    shrinkage: number;
    laborCost: number;
    operatingCost: number;
    profit: number;
    profitMargin: number;
  };
}

export interface LocationSettings {
  locationId: string;
  general: {
    storeName: string;
    legalName: string;
    taxId: string;
    businessLicense: string;
    phone: string;
    email: string;
    website: string;
  };
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    receiptHeader: string;
    receiptFooter: string;
  };
  payments: {
    acceptedMethods: string[];
    cashHandling: boolean;
    creditCardProcessing: boolean;
    giftCards: boolean;
    storeCredit: boolean;
    splitPayments: boolean;
    tipProcessing: boolean;
  };
  inventory: {
    lowStockAlerts: boolean;
    autoReorder: boolean;
    barcodeScanning: boolean;
    batchTracking: boolean;
    expiryTracking: boolean;
    multiWarehouse: boolean;
  };
  employees: {
    timeTracking: boolean;
    scheduling: boolean;
    permissionLevels: boolean;
    commissionTracking: boolean;
    tipPooling: boolean;
  };
  customers: {
    loyaltyProgram: boolean;
    customerAccounts: boolean;
    emailMarketing: boolean;
    smsMarketing: boolean;
    appointmentBooking: boolean;
  };
  integrations: {
    accounting: string[];
    ecommerce: string[];
    marketing: string[];
    shipping: string[];
    payment: string[];
  };
}

export interface LocationUser {
  id: string;
  userId: string;
  locationId: string;
  role: 'manager' | 'supervisor' | 'cashier' | 'stock' | 'admin';
  permissions: string[];
  isActive: boolean;
  assignedAt: Date;
  lastLogin?: Date;
}

export interface LocationReport {
  id: string;
  locationId: string;
  reportType: 'sales' | 'inventory' | 'employees' | 'customers' | 'financial' | 'performance';
  title: string;
  description: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MultiLocationService {
  private locations = signal<Location[]>([]);
  private transfers = signal<LocationTransfer[]>([]);
  private inventorySyncs = signal<InventorySync[]>([]);
  private locationPerformance = signal<LocationPerformance[]>([]);
  private locationSettings = signal<LocationSettings[]>([]);
  private locationUsers = signal<LocationUser[]>([]);
  private locationReports = signal<LocationReport[]>([]);

  // Computed signals
  locations$ = computed(() => this.locations());
  transfers$ = computed(() => this.transfers());
  inventorySyncs$ = computed(() => this.inventorySyncs());
  locationPerformance$ = computed(() => this.locationPerformance());
  locationSettings$ = computed(() => this.locationSettings());
  locationUsers$ = computed(() => this.locationUsers());
  locationReports$ = computed(() => this.locationReports());

  constructor() {
    this.initializeMockData();
  }

  // Location Management
  createLocation(locationData: Omit<Location, 'id' | 'childLocationIds' | 'employees' | 'createdAt' | 'updatedAt'>): Location {
    const location: Location = {
      id: uuid(),
      childLocationIds: [],
      employees: [],
      ...locationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.locations.update(locations => [...locations, location]);
    
    // Initialize default settings
    this.initializeLocationSettings(location.id);
    
    return location;
  }

  updateLocation(locationId: string, updates: Partial<Location>): Location | null {
    const locations = this.locations();
    const index = locations.findIndex(l => l.id === locationId);
    
    if (index === -1) return null;

    const updatedLocation = {
      ...locations[index],
      ...updates,
      updatedAt: new Date()
    };

    this.locations.update(locs => [...locs.slice(0, index), updatedLocation, ...locs.slice(index + 1)]);
    return updatedLocation;
  }

  getLocation(locationId: string): Location | null {
    return this.locations().find(l => l.id === locationId) || null;
  }

  getLocationsByType(type: Location['type']): Location[] {
    return this.locations().filter(l => l.type === type && l.status === 'active');
  }

  getChildLocations(parentLocationId: string): Location[] {
    const parent = this.getLocation(parentLocationId);
    if (!parent) return [];

    return this.locations().filter(l => parent.childLocationIds.includes(l.id));
  }

  // Inventory Transfer Management
  createTransfer(
    fromLocationId: string,
    toLocationId: string,
    items: Omit<TransferItem, 'totalCost'>[],
    initiatedBy: string,
    estimatedArrival?: Date
  ): LocationTransfer {
    const transferItems = items.map(item => ({
      ...item,
      totalCost: item.quantity * item.unitCost
    }));

    const totalCost = transferItems.reduce((sum, item) => sum + item.totalCost, 0);

    const transfer: LocationTransfer = {
      id: uuid(),
      fromLocationId,
      toLocationId,
      status: 'pending',
      items: transferItems,
      initiatedBy,
      initiatedAt: new Date(),
      estimatedArrival,
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    this.transfers.update(transfers => [...transfers, transfer]);
    
    // Update inventory at source location
    this.updateInventoryForTransfer(transfer, 'remove');
    
    return transfer;
  }

  updateTransferStatus(transferId: string, status: LocationTransfer['status'], receivedBy?: string): boolean {
    const transfer = this.transfers().find(t => t.id === transferId);
    if (!transfer) return false;

    const updatedTransfer = {
      ...transfer,
      status,
      receivedBy,
      receivedAt: status === 'received' ? new Date() : undefined,
      actualArrival: status === 'received' ? new Date() : transfer.actualArrival
    };

    this.transfers.update(transfers => 
      transfers.map(t => t.id === transferId ? updatedTransfer : t)
    );

    // Update inventory at destination location when received
    if (status === 'received') {
      this.updateInventoryForTransfer(updatedTransfer, 'add');
    }

    return true;
  }

  getPendingTransfers(locationId: string): LocationTransfer[] {
    return this.transfers().filter(t => 
      (t.fromLocationId === locationId || t.toLocationId === locationId) &&
      (t.status === 'pending' || t.status === 'in_transit')
    );
  }

  // Inventory Synchronization
  syncInventory(
    locationId: string,
    productId: string,
    actualQuantity: number,
    syncType: InventorySync['syncType'],
    syncedBy: string,
    notes?: string
  ): InventorySync {
    const currentSync = this.inventorySyncs()
      .find(s => s.locationId === locationId && s.productId === productId);

    const systemQuantity = currentSync?.systemQuantity || 0;
    const variance = actualQuantity - systemQuantity;
    const unitCost = this.getProductCost(productId);
    const varianceValue = variance * unitCost;

    const sync: InventorySync = {
      id: uuid(),
      locationId,
      productId,
      systemQuantity,
      actualQuantity,
      variance,
      varianceValue,
      lastSyncDate: new Date(),
      syncType,
      syncedBy,
      notes
    };

    this.inventorySyncs.update(syncs => [...syncs, sync]);
    
    // Update inventory records
    this.updateLocationInventory(locationId, productId, actualQuantity);
    
    return sync;
  }

  // Performance Tracking
  recordLocationPerformance(
    locationId: string,
    period: LocationPerformance['period'],
    date: Date,
    metrics: LocationPerformance['metrics']
  ): LocationPerformance {
    const performance: LocationPerformance = {
      id: uuid(),
      locationId,
      period,
      date,
      metrics
    };

    this.locationPerformance.update(perfs => [...perfs, performance]);
    return performance;
  }

  getLocationPerformance(
    locationId: string,
    period: LocationPerformance['period'],
    dateRange: { start: Date; end: Date }
  ): LocationPerformance[] {
    return this.locationPerformance().filter(p => 
      p.locationId === locationId &&
      p.period === period &&
      p.date >= dateRange.start &&
      p.date <= dateRange.end
    ).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // User Management
  assignUserToLocation(
    userId: string,
    locationId: string,
    role: LocationUser['role'],
    permissions: string[]
  ): LocationUser {
    const locationUser: LocationUser = {
      id: uuid(),
      userId,
      locationId,
      role,
      permissions,
      isActive: true,
      assignedAt: new Date()
    };

    this.locationUsers.update(users => [...users, locationUser]);
    
    // Update location employee list
    this.updateLocation(locationId, {
      employees: [...(this.getLocation(locationId)?.employees || []), userId]
    });
    
    return locationUser;
  }

  getUserLocations(userId: string): Location[] {
    const userAssignments = this.locationUsers().filter(u => u.userId === userId && u.isActive);
    const locationIds = userAssignments.map(u => u.locationId);
    
    return this.locations().filter(l => locationIds.includes(l.id));
  }

  hasLocationPermission(userId: string, locationId: string, permission: string): boolean {
    const userAssignment = this.locationUsers().find(u => 
      u.userId === userId && 
      u.locationId === locationId && 
      u.isActive
    );
    
    return userAssignment?.permissions.includes(permission) || false;
  }

  // Reporting
  generateLocationReport(
    locationId: string,
    reportType: LocationReport['reportType'],
    dateRange: { start: Date; end: Date },
    generatedBy: string
  ): LocationReport {
    const data = this.generateReportData(locationId, reportType, dateRange);
    
    const report: LocationReport = {
      id: uuid(),
      locationId,
      reportType,
      title: `${this.getLocation(locationId)?.name} - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      description: `Generated ${reportType} report for ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
      dateRange,
      data,
      generatedAt: new Date(),
      generatedBy,
      format: 'pdf',
      isScheduled: false,
      recipients: []
    };

    this.locationReports.update(reports => [...reports, report]);
    return report;
  }

  // Analytics
  getMultiLocationAnalytics(dateRange: { start: Date; end: Date }): {
    totalRevenue: number;
    totalTransactions: number;
    totalCustomers: number;
    topPerformingLocations: Array<{
      location: Location;
      revenue: number;
      transactions: number;
      growth: number;
    }>;
    locationComparison: Array<{
      locationId: string;
      locationName: string;
      revenue: number;
      transactions: number;
      averageTransaction: number;
      profit: number;
      profitMargin: number;
    }>;
    transferActivity:: {
      totalTransfers: number;
      totalValue: number;
      activeTransfers: number;
      averageTransferTime: number;
    };
  } {
    const locations = this.locations().filter(l => l.status === 'active');
    const performances = this.locationPerformance().filter(p => 
      p.date >= dateRange.start && p.date <= dateRange.end
    );

    const totalRevenue = performances.reduce((sum, p) => sum + p.metrics.revenue, 0);
    const totalTransactions = performances.reduce((sum, p) => sum + p.metrics.transactions, 0);
    const totalCustomers = performances.reduce((sum, p) => sum + p.metrics.customers, 0);

    // Calculate location performance
    const locationComparison = locations.map(location => {
      const locationPerf = performances.filter(p => p.locationId === location.id);
      const revenue = locationPerf.reduce((sum, p) => sum + p.metrics.revenue, 0);
      const transactions = locationPerf.reduce((sum, p) => sum + p.metrics.transactions, 0);
      const profit = locationPerf.reduce((sum, p) => sum + p.metrics.profit, 0);
      
      return {
        locationId: location.id,
        locationName: location.name,
        revenue,
        transactions,
        averageTransaction: transactions > 0 ? revenue / transactions : 0,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    });

    const topPerformingLocations = locationComparison
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(lc => ({
        location: locations.find(l => l.id === lc.locationId)!,
        revenue: lc.revenue,
        transactions: lc.transactions,
        growth: 0 // Would calculate based on previous period
      }));

    // Transfer analytics
    const transfers = this.transfers().filter(t => 
      t.initiatedAt >= dateRange.start && t.initiatedAt <= dateRange.end
    );
    const totalTransferValue = transfers.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + item.totalCost, 0), 0
    );

    return {
      totalRevenue,
      totalTransactions,
      totalCustomers,
      topPerformingLocations,
      locationComparison,
      transferActivity: {
        totalTransfers: transfers.length,
        totalValue: totalTransferValue,
        activeTransfers: transfers.filter(t => t.status === 'pending' || t.status === 'in_transit').length,
        averageTransferTime: 0 // Would calculate based on actual data
      }
    };
  }

  // Private helper methods
  private initializeLocationSettings(locationId: string): void {
    const settings: LocationSettings = {
      locationId,
      general: {
        storeName: '',
        legalName: '',
        taxId: '',
        businessLicense: '',
        phone: '',
        email: '',
        website: ''
      },
      branding: {
        logo: '',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        receiptHeader: 'Thank you for your purchase!',
        receiptFooter: 'Please come again soon!'
      },
      payments: {
        acceptedMethods: ['cash', 'credit_card', 'debit_card'],
        cashHandling: true,
        creditCardProcessing: true,
        giftCards: true,
        storeCredit: true,
        splitPayments: true,
        tipProcessing: true
      },
      inventory: {
        lowStockAlerts: true,
        autoReorder: false,
        barcodeScanning: true,
        batchTracking: false,
        expiryTracking: false,
        multiWarehouse: false
      },
      employees: {
        timeTracking: true,
        scheduling: true,
        permissionLevels: true,
        commissionTracking: false,
        tipPooling: false
      },
      customers: {
        loyaltyProgram: true,
        customerAccounts: true,
        emailMarketing: true,
        smsMarketing: false,
        appointmentBooking: false
      },
      integrations: {
        accounting: [],
        ecommerce: [],
        marketing: [],
        shipping: [],
        payment: []
      }
    };

    this.locationSettings.update(settingsArray => [...settingsArray, settings]);
  }

  private updateInventoryForTransfer(transfer: LocationTransfer, action: 'add' | 'remove'): void {
    // This would integrate with the inventory service
    // For now, we'll just create sync records
    transfer.items.forEach(item => {
      const locationId = action === 'add' ? transfer.toLocationId : transfer.fromLocationId;
      const quantity = action === 'add' ? item.quantity : -item.quantity;
      
      this.syncInventory(
        locationId,
        item.productId,
        quantity,
        'adjustment',
        'system',
        `Transfer ${action}: ${transfer.id}`
      );
    });
  }

  private updateLocationInventory(locationId: string, productId: string, quantity: number): void {
    // This would update the actual inventory records
    // Implementation would depend on inventory service integration
  }

  private getProductCost(productId: string): number {
    // This would get the actual product cost from product service
    return 10; // Placeholder
  }

  private generateReportData(locationId: string, reportType: LocationReport['reportType'], dateRange: { start: Date; end: Date }): any {
    // This would generate actual report data based on type and date range
    return {
      summary: 'Report data would be generated here',
      locationId,
      reportType,
      dateRange
    };
  }

  private initializeMockData(): void {
    // Initialize with mock locations
    const mockLocations: Location[] = [
      {
        id: uuid(),
        name: 'Downtown Store',
        code: 'DT01',
        type: 'store',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        contact: {
          phone: '555-0101',
          email: 'downtown@store.com',
          manager: 'John Smith'
        },
        operatingHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '10:00', close: '22:00' },
          sunday: { open: '11:00', close: '19:00' }
        },
        timezone: 'America/New_York',
        currency: 'USD',
        taxRates: {
          salesTax: 0.08875,
          localTax: 0.045,
          stateTax: 0.04,
          federalTax: 0
        },
        settings: {
          allowOnlineOrders: true,
          allowInStorePickup: true,
          allowDelivery: true,
          deliveryRadius: 5,
          inventoryTracking: true,
          employeeScheduling: true
        },
        status: 'active',
        openDate: new Date('2020-01-15'),
        childLocationIds: [],
        employees: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'Main Warehouse',
        code: 'WH01',
        type: 'warehouse',
        address: {
          street: '456 Industrial Way',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'USA'
        },
        contact: {
          phone: '555-0102',
          email: 'warehouse@store.com',
          manager: 'Sarah Johnson'
        },
        operatingHours: {
          monday: { open: '06:00', close: '18:00' },
          tuesday: { open: '06:00', close: '18:00' },
          wednesday: { open: '06:00', close: '18:00' },
          thursday: { open: '06:00', close: '18:00' },
          friday: { open: '06:00', close: '18:00' },
          saturday: { open: '08:00', close: '14:00' },
          sunday: { closed: true }
        },
        timezone: 'America/New_York',
        currency: 'USD',
        taxRates: {
          salesTax: 0,
          localTax: 0,
          stateTax: 0,
          federalTax: 0
        },
        settings: {
          allowOnlineOrders: false,
          allowInStorePickup: false,
          allowDelivery: false,
          deliveryRadius: 0,
          inventoryTracking: true,
          employeeScheduling: true
        },
        status: 'active',
        openDate: new Date('2019-06-01'),
        childLocationIds: [],
        employees: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.locations.set(mockLocations);

    // Initialize settings for mock locations
    mockLocations.forEach(location => {
      this.initializeLocationSettings(location.id);
    });
  }
}
