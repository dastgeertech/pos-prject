import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HardwareService, HardwareDevice, PrintJob, ScanEvent, HardwareAlert, HardwareLog, HardwareSettings } from '../../services/hardware.service';

@Component({
  selector: 'app-hardware-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hardware-management.component.html',
  styleUrls: ['./hardware-management.component.scss']
})
export class HardwareManagementComponent implements OnInit {
  selectedTab = signal<string>('devices');
  
  // Service signals
  devices = computed(() => this.hardwareService.devices$());
  printJobs = computed(() => this.hardwareService.printJobs$());
  scanEvents = computed(() => this.hardwareService.scanEvents$());
  hardwareAlerts = computed(() => this.hardwareService.hardwareAlerts$());
  hardwareLogs = computed(() => this.hardwareService.hardwareLogs$());
  
  // Form models
  newDeviceForm = signal<Partial<HardwareDevice>>({});
  deviceSettingsForm = signal<Partial<HardwareSettings>>({});
  
  // UI state
  isAddingDevice = signal(false);
  selectedDevice = signal<HardwareDevice | null>(null);
  selectedAlert = signal<HardwareAlert | null>(null);
  selectedPrintJob = signal<PrintJob | null>(null);
  
  // Filter states
  deviceTypeFilter = signal<string>('all');
  deviceStatusFilter = signal<string>('all');
  alertSeverityFilter = signal<string>('all');
  
  constructor(private hardwareService: HardwareService) {}
  
  ngOnInit() {
    this.initializeNewDeviceForm();
  }
  
  private initializeNewDeviceForm() {
    this.newDeviceForm.set({
      name: '',
      type: 'barcode_scanner',
      model: '',
      manufacturer: '',
      connectionType: 'usb',
      status: 'disconnected',
      isActive: true,
      settings: {},
      capabilities: []
    });
  }
  
  // Device management
  addDevice() {
    const deviceData = this.newDeviceForm();
    if (deviceData.name && deviceData.type) {
      this.hardwareService.addDevice(deviceData as Omit<HardwareDevice, 'id' | 'createdAt' | 'updatedAt'>);
      this.isAddingDevice.set(false);
      this.initializeNewDeviceForm();
    }
  }
  
  updateDevice(deviceId: string, updates: Partial<HardwareDevice>) {
    this.hardwareService.updateDevice(deviceId, updates);
  }
  
  removeDevice(deviceId: string) {
    this.hardwareService.removeDevice(deviceId);
  }
  
  connectDevice(deviceId: string) {
    this.hardwareService.connectDevice(deviceId);
  }
  
  disconnectDevice(deviceId: string) {
    this.hardwareService.disconnectDevice(deviceId);
  }
  
  // Print job management
  createPrintJob(deviceId: string, content: any, type: PrintJob['type'] = 'receipt') {
    this.hardwareService.createPrintJob(deviceId, content, type);
  }
  
  cancelPrintJob(jobId: string) {
    this.hardwareService.cancelPrintJob(jobId);
  }
  
  retryPrintJob(jobId: string) {
    this.hardwareService.retryPrintJob(jobId);
  }
  
  // Alert management
  resolveAlert(alertId: string, resolvedBy: string = 'current-user') {
    this.hardwareService.resolveAlert(alertId, resolvedBy);
  }
  
  // Settings management
  updateDeviceSettings(deviceId: string, settings: Partial<HardwareSettings>) {
    this.hardwareService.updateDeviceSettings(deviceId, settings);
  }
  
  // Helper methods for UI
  getDeviceIcon(type: HardwareDevice['type']): string {
    const icons = {
      barcode_scanner: '📷',
      receipt_printer: '🖨️',
      cash_drawer: '💰',
      label_printer: '🏷️',
      scale: '⚖️',
      customer_display: '📺'
    };
    return icons[type] || '🔌';
  }
  
  getStatusColor(status: HardwareDevice['status']): string {
    const colors = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
  
  getSeverityColor(severity: HardwareAlert['severity']): string {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  }
  
  getPrintJobStatusIcon(status: PrintJob['status']): string {
    const icons = {
      queued: '⏳',
      printing: '🔄',
      completed: '✅',
      failed: '❌',
      cancelled: '🚫'
    };
    return icons[status] || '❓';
  }
  
  // Filter methods
  filteredDevices() {
    const devices = this.devices();
    const typeFilter = this.deviceTypeFilter();
    const statusFilter = this.deviceStatusFilter();
    
    return devices.filter(device => {
      const typeMatch = typeFilter === 'all' || device.type === typeFilter;
      const statusMatch = statusFilter === 'all' || device.status === statusFilter;
      return typeMatch && statusMatch;
    });
  }
  
  filteredAlerts() {
    const alerts = this.hardwareAlerts();
    const severityFilter = this.alertSeverityFilter();
    
    return alerts.filter(alert => {
      return severityFilter === 'all' || alert.severity === severityFilter;
    });
  }
  
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}