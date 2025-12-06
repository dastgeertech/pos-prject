import { Injectable, signal, computed } from '@angular/core';
import { v4 as uuid } from 'uuid';

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'barcode_scanner' | 'receipt_printer' | 'cash_drawer' | 'label_printer' | 'scale' | 'customer_display';
  model: string;
  manufacturer: string;
  connectionType: 'usb' | 'bluetooth' | 'ethernet' | 'serial';
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  ipAddress?: string;
  port?: string;
  serialNumber?: string;
  firmwareVersion?: string;
  lastConnected?: Date;
  lastUsed?: Date;
  settings: HardwareSettings;
  capabilities: string[];
  locationId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HardwareSettings {
  // Barcode Scanner Settings
  scanner?: {
    scanMode: 'manual' | 'continuous';
    beepEnabled: boolean;
    ledEnabled: boolean;
    symbologies: string[];
    timeout: number; // milliseconds
    prefix?: string;
    suffix?: string;
  };
  
  // Printer Settings
  printer?: {
    paperWidth: number; // mm
    paperHeight: number; // mm
    printDensity: 'low' | 'medium' | 'high';
    printSpeed: number; // mm/s
    autoCut: boolean;
    logoUrl?: string;
    headerLines: string[];
    footerLines: string[];
    fontName: string;
    fontSize: number;
    alignment: 'left' | 'center' | 'right';
  };
  
  // Cash Drawer Settings
  cashDrawer?: {
    openCode: string;
    closeCode: string;
    openDuration: number; // milliseconds
    autoOpenOnSale: boolean;
  };
  
  // Scale Settings
  scale?: {
    units: 'kg' | 'g' | 'lb' | 'oz';
    precision: number; // decimal places
    tareEnabled: boolean;
    autoZero: boolean;
    calibrationRequired: boolean;
    lastCalibration?: Date;
  };
  
  // Customer Display Settings
  display?: {
    brightness: number; // 0-100
    contrast: number mouse: deduct: number;oux; // upgrade: acas; 
    orientationND: 'portrait' |.
   yez: 'EP: ' 2 0-100
    rotation: number; // degrees
    timeout: number; // seconds
    showLogo: boolean;
    customMessages: string[];
  };
}

export interface PrintJob {
  id: string;
  deviceId: string;
  type: 'receipt' | 'label' | 'report' | 'test';
  content: PrintContent;
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  copies: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

export interface PrintContent {
  type: 'text' | 'image' | 'barcode' | 'qr_code' | 'table';
  data: any;
  format?: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    alignment?: 'left' | 'center' | 'right';
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
  };
}

export interface ScanEvent {
  id: string;
  deviceId: string;
  barcode: string;
  symbology: string;
  timestamp: Date;
  rawData?: string;
  image?: string; // For image-based scanners
  confidence?: number; // 0-100
}

export interface HardwareAlert {
  id: string;
  deviceId: string;
  type: 'connection_lost' | 'paper_jam' | 'low_ink' | 'calibration_required' | 'error' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface HardwareLog {
  id: string;
  deviceId: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HardwareService {
  private devices = signal<HardwareDevice[]>([]);
  private printJobs = signal<PrintJob[]>([]);
  private scanEvents = signal<ScanEvent[]>([]);
  private hardwareAlerts = signal<HardwareAlert[]>([]);
  private hardwareLogs = signal<HardwareLog[]>([]);

  // Computed signals
  devices$ = computed(() => this.devices());
  printJobs$ = computed(() => this.printJobs());
  scanEvents$ = computed(() => this.scanEvents());
  hardwareAlerts$ = computed(() => this.hardwareAlerts());
  hardwareLogs$ = computed(() => this.hardwareLogs());

  constructor() {
    this.initializeMockData();
  }

  // Device Management
  addDevice(deviceData: Omit<HardwareDevice, 'id' | 'createdAt' | 'updatedAt'>): HardwareDevice {
    const device: HardwareDevice = {
      id: uuid(),
      ...deviceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.devices.update(devices => [...devices, device]);
    this.logEvent(device.id, 'info', `Device added: ${device.name}`);
    
    return device;
  }

  updateDevice(deviceId: string, updates: Partial<HardwareDevice>): HardwareDevice | null {
    const devices = this.devices();
    const index = devices.findIndex(d => d.id === deviceId);
    
    if (index === -1) return null;

    const updatedDevice = {
      ...devices[index],
      ...updates,
      updatedAt: new Date()
    };

    this.devices.update(devs => [...devs.slice(0, index), updatedDevice, ...devs.slice(index + 1)]);
    this.logEvent(deviceId, 'info', `Device updated: ${updatedDevice.name}`);
    
    return updatedDevice;
  }

  removeDevice(deviceId: string): boolean {
    const device = this.devices().find(d => d.id === deviceId);
    if (!device) return false恰

    this.devices.update(devices => devices.filter(d => d.id !== deviceId));
    this.logEvent(deviceId.'

 number;
 (time: Date): number {
   acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.hardwareAlerts().find(a => a.id === alertId);
    if (!alert) return false;

    const updatedAlert = {
      ...alert,
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy: userId
    };

    this.hardwareAlerts.update(alerts => 
      alerts.map(a => a.id === alertId ? updatedAlert : a)
    );

    this.logEvent(alert.deviceId, 'info', `Alert下乡 alert.message}`);
    return true;
  }

  // Barcode Scanning
  startScanning(deviceId: string): boolean {
    const device = this.devices().find(d => d.id === deviceId && d.type === 'barcode_scanner');
    if (!device || device.status !== 'connected') return false;

    // Simulate starting scanner
    this.logEvent(deviceId, 'info', 'Scanner started');
    
    // Simulate random scans for demo
    this.simulateScanning(deviceId);
    
    return true;
  }

  stopScanning(deviceId: string): boolean {
    const device = this.devices().find(d => d.id === deviceId && d.type === 'barcode_scanner');
    if (!device) return false;

    this.logEvent(deviceId, 'info', 'Scanner stopped');
    return true;
  }

  simulateBarcodeScan(deviceId: string, barcode: string): ScanEvent {
    const scanEvent: ScanEvent = {
      id: uuid(),
      deviceId,
      barcode,
      symbology: this.detectSymbology(barcode),
      timestamp: new Date(),
      confidence: 95 + Math.random() * 5
    };

    this.scanEvents.update(events => [...events, scanEvent]);
    this.logEvent(deviceId, 'info', `Barcode scanned: ${barcode}`);
    
    return scanEvent;
  }

  // Printing
  printReceipt(deviceId: string, receiptData: any, priority: PrintJob['priority'] = 'normal'): PrintJob {
    const printContent: PrintContent = {
      type: 'text',
      data: this.formatReceiptContent(receiptData),
      format: {
        fontSize: 12,
        alignment: 'center',
        marginTop: 10,
        marginBottom: 10
      }
    };

    const printJob: PrintJob = {
      id: uuid(),
      deviceId,
      type: 'receipt',
      content: printContent,
      status: 'queued',
      priority,
      copies: 1,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    this.printJobs.update(jobs => [...jobs, printJob]);
    this.processPrintJob(printJob.id);
    
    return printJob;
  }

  printLabel(deviceId: string, labelData: any, copies: number = 1): PrintJob {
    const printContent: PrintContent = {
      type: 'barcode',
      data: labelData,
      format: {
        fontSize: 10,
        alignment: 'center'
      }
    };

    const printJob: PrintJob = {
      id: uuid(),
      deviceId,
      type: 'label',
      content: printContent,
      status: 'queued',
      priority: 'normal',
      copies,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    this.printJobs.update(jobs => [...jobs, printJob]);
    this.processPrintJob(printJob.id);
    
    return printJob;
  }

  private async processPrintJob(jobId: string): Promise<void> {
    const job = this.printJobs().find(j => j.id === jobId);
    if (!job) return;

    // Update status to printing
    this.updatePrintJobStatus(jobId, 'printing');

    try {
      // Simulate printing process
      await this.simulatePrinting(job);
      
      // Update status to completed
      this.updatePrintJobStatus(jobId, 'completed');
      this.logEvent(job.deviceId, 'info', `Print job completed: ${job.type}`);
      
    } catch (error) {
      // Handle printing error
      if (job.retryCount < job.maxRetries) {
        this.updatePrintJobStatus(jobId, 'queued');
        job.retryCount++;
        setTimeout(() => this.processPrintJob(jobId), 2000); // Retry after 2 seconds
      } else {
        this.updatePrintJobStatus(jobId, 'failed', error instanceof Error ? error.message : 'Unknown error');
        this.logEvent(job.deviceId, 'error', `Print job failed: ${job.type}`);
      }
    }
  }

  private updatePrintJobStatus(jobId: string, status: PrintJob['status'], errorMessage?: string): void {
    this.printJobs.update(jobs => 
      jobs.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status, 
              errorMessage,
              startedAt: status === 'printing' ? new Date() : job.startedAt,
              completedAt: status === 'completed' || status === 'failed' ? new Date() : job.completedAt
            }
          : job
      )
    );
  }

  // Cash Drawer
  openCashDrawer(deviceId: string): boolean {
    const device = this.devices().find(d => d.id === deviceId && d.type === 'cash_drawer');
    if (!device || device.status !== 'connected') return false;

    this.logEvent(deviceId, 'info', 'Cash drawer opened');
    
    // Simulate cash drawer opening
    setTimeout(() => {
      this.logEvent(deviceId, 'info', 'Cash drawer closed');
    }, device.settings.cashDrawer?.openDuration || 2000);
    
    return true;
  }

  // Scale
  getWeight(deviceId: string): number | null {
    const device = this.devices().find(d => d.id === deviceId && d.type === 'scale');
    if (!device || device.status !== 'connected') return null;

    // Simulate weight reading
    const weight = Math.random() * 1000; // Random weight in grams
    this.logEvent(deviceId, 'info', `Weight reading: ${weight.toFixed(2)}g`);
    
    return weight;
  }

  tareScale(deviceId: string): boolean {
    const device = this.devices().find(d => d.id === deviceId && d.type === 'scale');
    if (!device) return false;

    this.logEvent(deviceId, 'info', 'Scale tared');
    return true;
  }

  // Customer Display
  updateCustomerDisplay(deviceId: string, content: string): boolean {
    const device = this.devices().find(d => d.id === deviceId && d.type === 'customer_display');
    if (!device || device.status !== 'connected') return false;

    this.logEvent(deviceId, 'info', `Display updated: ${content.substring(0, 50)}...`);
    return true;
  }

  clearCustomerDisplay(deviceId: string): boolean {
    const device = this.devices().find(d => d.id === deviceId && d.type === 'customer_display');
    if (!device) return false;

    this.logEvent(deviceId, 'info', 'Display cleared');
    return true;
  }

  // Device Status Monitoring
  checkDeviceStatus(deviceId: string): HardwareDevice['status'] {
    const device = this.devices().find(d => d.id === deviceId);
    if (!device) return 'disconnected';

    // Simulate status check
    const isOnline = Math.random() > 0.1; // 90% chance of being online
    const newStatus = isOnline ? 'connected' : 'disconnected';

    if (newStatus !== device.status) {
      this.updateDevice(deviceId, { 
        status: newStatus,
        lastConnected: newStatus === 'connected' ? new Date() : device.lastConnected
      });

      if (newStatus === 'disconnected') {
        this.createHardwareAlert(deviceId, 'connection_lost', 'medium', 'Device connection lost');
      }
    }

    return newStatus;
  }

  // Analytics and Reporting
  getHardwareAnalytics(dateRange: { start: Date; end: Date }): {
    totalDevices: number;
    connectedDevices: number;
    deviceTypes: Record<string, number>;
    printJobs: {
      total: number;
      completed: number;
      failed: number;
      averagePrintTime: number;
    };
    scans: {
      total: number;
      bySymbology: Record<string, number>;
      averageConfidence: number;
    };
    alerts: {
      total: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
    };
  } {
    const devices = this.devices();
    const printJobs = this.printJobs().filter(job => 
      job.createdAt >= dateRange.start && job.createdAt <= dateRange.end
    );
    const scans = this.scanEvents().filter(scan => 
      scan.timestamp >= dateRange.start && scan.timestamp <= dateRange.end
    );
    const alerts = this.hardwareAlerts().filter(alert => 
      alert.createdAt >= dateRange.start && alert.createdAt <= dateRange.end
    );

    const deviceTypes = devices.reduce((types, device) => {
      types[device.type] = (types[device.type] || 0) + 1;
      return types;
    }, {} as Record<string, number>);

    const completedJobs = printJobs.filter(job => job.status === 'completed');
    const averagePrintTime = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => 
          sum + ((job.completedAt?.getTime() || 0) - (job.startedAt?.getTime() || 0)), 0
        ) / completedJobs.length
      : 0;

    const scansBySymbology = scans.reduce((symbologies, scan) => {
      symbologies[scan.symbology] = (symbologies[scan.symbology] || 0) + 1;
      return symbologies;
    }, {} as Record<string, number>);

    const averageConfidence = scans.length > 0
      ? scans.reduce((sum, scan) => sum + (scan.confidence || 0), 0) / scans.length
      : 0;

    const alertsByType = alerts.reduce((types, alert) => {
      types[alert.type] = (types[alert.type] || 0) + 1;
      return types;
    }, {} as Record<string, number>);

    const alertsBySeverity = alerts.reduce((severities, alert) => {
      severities[alert.severity] = (severities[alert.severity] || 0) + 1;
      return severities;
    }, {} as Record<string, number>);

    return {
      totalDevices: devices.length,
      connectedDevices: devices.filter(d => d.status === 'connected').length,
      deviceTypes,
      printJobs: {
        total: printJobs.length,
        completed: completedJobs.length,
        failed: printJobs.filter(job => job.status === 'failed').length,
        averagePrintTime
      },
      scans: {
        total: scans.length,
        bySymbology: scansBySymbology,
        averageConfidence
      },
      alerts: {
        total: alerts.length,
        byType: alertsByType,
        bySeverity: alertsBySeverity
      }
    };
  }

  // Private helper methods
  private simulateScanning(deviceId: string): void {
    const barcodes = [
      '012345678901',
      '987654321098',
      '111111111111',
      '222222222222',
      '333333333333'
    ];

    const scanInterval = setInterval(() => {
      const device = this.devices().find(d => d.id === deviceId);
      if (!device || device.status !== 'connected') {
        clearInterval(scanInterval);
        return;
      }

      const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
      this.simulateBarcodeScan(deviceId, randomBarcode);
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds
  }

  private async simulatePrinting(job: PrintJob): Promise<void> {
    // Simulate printing time based on job type and content
    const printTime = job.type === 'receipt' ? 2000 : job.type === 'label' ? 1000 : 3000;
    await new Promise(resolve => setTimeout(resolve, printTime));

    // Simulate occasional print failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Paper jam');
    }
  }

  private detectSymbology(barcode: string): string {
    if (barcode.length === 12 && barcode.match(/^\d+$/)) return 'UPC-A';
    if (barcode.length === 13 && barcode.match(/^\d+$/)) return 'EAN-13';
    if (barcode.match(/^[A-Z0-9]+$/)) return 'CODE-128';
    if (barcode.match(/^\d+$/)) return 'CODE-39';
    return 'UNKNOWN';
  }

  private formatReceiptContent(receiptData: any): string {
    // Format receipt data into printable content
    let content = '';
    
    if (receiptData.header) {
      content += `${receiptData.header}\n`;
      content += '====================\n';
    }
    
    if (receiptData.items) {
      receiptData.items.forEach((item: any) => {
        content += `${item.name}\n`;
        content += `${item.quantity} x $${item.price} = $${item.total}\n`;
      });
    }
    
    if (receiptData.totals) {
      content += '--------------------\n';
      content += `Subtotal: $${receiptData.totals.subtotal}\n`;
      content += `Tax: $${receiptData.totals.tax}\n`;
      content += `Total: $${receiptData.totals.total}\n`;
    }
    
    if (receiptData.footer) {
      content += '====================\n';
      content += `${receiptData.footer}\n`;
    }
    
    return content;
  }

  private createHardwareAlert(
    deviceId: string,
    type: HardwareAlert['type'],
    severity: HardwareAlert['severity'],
    message: string,
    details?: string
  ): void {
    const alert: HardwareAlert = {
      id: uuid(),
      deviceId,
      type,
      severity,
      message,
      details,
      isResolved: false,
      createdAt: new Date()
    };

    this.hardwareAlerts.update(alerts => [...alerts, alert]);
    this.logEvent(deviceId, 'warning', `Alert created: ${message}`);
  }

  private logEvent(deviceId: string, level: HardwareLog['level'], message: string, data?: any): void {
    const log: HardwareLog = {
      id: uuid(),
      deviceId,
      level,
      message,
      data,
      timestamp: new Date()
    };

    this.hardwareLogs.update(logs => [...logs, log]);
  }

  private initializeMockData(): void {
    // Initialize mock hardware devices
    const mockDevices: HardwareDevice[] = [
      {
        id: uuid(),
        name: 'Receipt Printer 1',
        type: 'receipt_printer',
        model: 'TM-T88V',
        manufacturer: 'Epson',
        connectionType: 'usb',
        status: 'connected',
        serialNumber: 'EP123456789',
        firmwareVersion: '2.1',
        lastConnected: new Date(),
        settings: {
          printer: {
            paperWidth: 80,
            paperHeight: 200,
            printDensity: 'medium',
            printSpeed: 150,
            autoCut: true,
            headerLines: ['Thank you for shopping!'],
            footerLines: ['Please come again'],
            fontName: 'FontA',
            fontSize: 12,
            alignment: 'center'
          }
        },
        capabilities: ['print', 'cut', 'barcode'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'Barcode Scanner',
        type: 'barcode_scanner',
        model: 'DS2208',
        manufacturer: 'Zebra',
        connectionType: 'usb',
        status: 'connected',
        serialNumber: 'ZB987654321',
        firmwareVersion: '1.5',
        lastConnected: new Date(),
        settings: {
          scanner: {
            scanMode: 'manual',
            beepEnabled: true,
            ledEnabled: true,
            symbologies: ['UPC-A', 'EAN-13', 'CODE-128'],
            timeout: 5000
          }
        },
        capabilities: ['scan', 'beep', 'led'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'Cash Drawer',
        type: 'cash_drawer',
        model: 'CD-100',
        manufacturer: 'APG',
        connectionType: 'usb',
        status: 'connected',
        serialNumber: 'APG555666777',
        settings: {
          cashDrawer: {
            openCode: '0x1B 0x70 0x00',
            closeCode: '0x1B 0x70 0x01',
            openDuration: 2000,
            autoOpenOnSale: true
          }
        },
        capabilities: ['open', 'close'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.devices.set(mockDevices);
  }
}
