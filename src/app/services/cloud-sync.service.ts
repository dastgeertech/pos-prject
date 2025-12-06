import { Injectable, signal, computed } from '@angular/core';
import { v4 as uuid } from 'uuid';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingUploads: number;
  pendingDownloads: number;
  syncInProgress: boolean;
  syncErrors: string[];
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'none';
  connectionSpeed: 'fast' | 'medium' | 'slow' | 'unknown';
}

export interface SyncOperation {
  id: string;
  type: 'upload' | 'download';
  entityType: 'product' | 'customer' | 'sale' | 'inventory' | 'employee' | 'settings';
  entityId: string;
  data: any;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  conflictResolution?: 'client_wins' | 'server_wins' | 'manual';
}

export interface OfflineData {
  id: string;
  entityType: string;
  entityId: string;
  data: any;
  version: number;
  lastModified: Date;
  isDirty: boolean;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
}

export interface ConflictResolution {
  id: string;
  operationId: string;
  entityType: string;
  entityId: string;
  clientData: any;
  serverData: any;
  conflictType: 'version_mismatch' | 'data_conflict' | 'delete_conflict';
  resolution?: 'client' | 'server' | 'merge';
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

export interface CloudSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  syncOnWifiOnly: boolean;
  maxRetries: number;
  retryDelay: number; // seconds
  batchSize: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriod: number; // days
  conflictResolution: 'client_wins' | 'server_wins' | 'manual';
}

export interface MobileDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'phone' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web' | 'desktop';
  appVersion: string;
  osVersion: string;
  isActive: boolean;
  lastSeen: Date;
  pushToken?: string;
  capabilities: string[];
  settings: {
    notifications: boolean;
    biometricAuth: boolean;
    offlineMode: boolean;
    autoSync: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PushNotification {
  id: string;
  userId: string;
  deviceId?: string;
  type: 'sync_status' | 'inventory_alert' | 'sale_completed' | 'system_update' | 'security';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface BackupRecord {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: number; // bytes
  compressedSize: number; // bytes
  location: 'cloud' | 'local' | 'both';
  status: 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  includes: string[];
  checksum: string;
  encrypted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CloudSyncService {
  private syncStatus = signal<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingUploads: 0,
    pendingDownloads: 0,
    syncInProgress: false,
    syncErrors: [],
    connectionType: 'none',
    connectionSpeed: 'unknown'
  });

  private syncOperations = signal<SyncOperation[]>([]);
  private offlineData = signal<OfflineData[]>([]);
  private conflicts = signal<ConflictResolution[]>([]);
  private cloudSettings = signal<CloudSettings>({
    autoSync: true,
    syncInterval: 5,
    syncOnWifiOnly: false,
    maxRetries: 3,
    retryDelay: 30,
    batchSize: 50,
    compressionEnabled: true,
    encryptionEnabled: true,
    backupFrequency: 'daily',
    retentionPeriod: 30,
    conflictResolution: 'server_wins'
  });

  private mobileDevices = signal<MobileDevice[]>([]);
  private pushNotifications = signal<PushNotification[]>([]);
  private backupRecords = signal<BackupRecord[]>([]);

  // Computed signals
  syncStatus$ = computed(() => this.syncStatus());
  syncOperations$ = computed(() => this.syncOperations());
  offlineData$ = computed(() => this.offlineData());
  conflicts$ = computed(() => this.conflicts());
  cloudSettings$ = computed(() => this.cloudSettings());
  mobileDevices$ = computed(() => this.mobileDevices());
  pushNotifications$ = computed(() => this.pushNotifications());
  backupRecords$ = computed(() => this.backupRecords());

  private syncInterval: any = null;

  constructor() {
    this.initializeService();
  }

  // Sync Management
  async startSync(): Promise<void> {
    if (this.syncStatus().syncInProgress) return;

    this.updateSyncStatus({ syncInProgress: true, syncErrors: [] });

    try {
      // Check connection
      if (!await this.checkConnection()) {
        throw new Error('No internet connection');
      }

      // Process pending uploads
      await this.processUploads();

      // Process pending downloads
      await this.processDownloads();

      // Update last sync time
      this.updateSyncStatus({ 
        lastSync: new Date(),
        syncInProgress: false
      });

    } catch (error) {
      this.updateSyncStatus({ 
        syncInProgress: false,
        syncErrors: [error instanceof Error ? error.message : 'Sync failed']
      });
    }
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.updateSyncStatus({ syncInProgress: false });
  }

  // Offline Data Management
  saveOfflineData(
    entityType: string,
    entityId: string,
    data: any,
    isDirty: boolean = true
  ): void {
    const existingData = this.offlineData().find(d => 
      d.entityType === entityType && d.entityId === entityId
    );

    const offlineRecord: OfflineData = {
      id: existingData?.id || uuid(),
      entityType,
      entityId,
      data,
      version: existingData?.version || 1,
      lastModified: new Date(),
      isDirty,
      syncStatus: isDirty ? 'pending' : 'synced'
    };

    if (existingData) {
      this.offlineData.update(data => 
        data.map(d => d.id === existingData.id ? offlineRecord : d)
      );
    } else {
      this.offlineData.update(data => [...data, offlineRecord]);
    }

    // Queue for sync if dirty
    if (isDirty && this.cloudSettings().autoSync) {
      this.queueSyncOperation('upload', entityType, entityId, data);
    }
  }

  getOfflineData(entityType: string, entityId: string): OfflineData | null {
    return this.offlineData().find(d => 
      d.entityType === entityType && d.entityId === entityId
    ) || null;
  }

  getAllOfflineData(entityType?: string): OfflineData[] {
    return entityType 
      ? this.offlineData().filter(d => d.entityType === entityType)
      : this.offlineData();
  }

  // Conflict Resolution
  async resolveConflict(
    conflictId: string,
    resolution: 'client' | 'server' | 'merge',
    resolvedBy: string
  ): Promise<boolean> {
    const conflict = this.conflicts().find(c => c.id === conflictId);
    if (!conflict) return false;

    const updatedConflict = {
      ...conflict,
      resolution,
      resolvedAt: new Date(),
      resolvedBy
    };

    this.conflicts.update(conflicts => 
      conflicts.map(c => c.id === conflictId ? updatedConflict : c)
    );

    // Apply resolution
    if (resolution === 'client') {
      await this.applyClientResolution(conflict);
    } else if (resolution === 'server') {
      await this.applyServerResolution(conflict);
    } else if (resolution === 'merge') {
      await this.applyMergeResolution(conflict);
    }

    return true;
  }

  // Mobile Device Management
  registerDevice(deviceData: Omit<MobileDevice, 'id' | 'createdAt' | 'updatedAt'>): MobileDevice {
    const device: MobileDevice = {
      id: uuid(),
      ...deviceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mobileDevices.update(devices => [...devices, device]);
    return device;
  }

  updateDevice(deviceId: string, updates: Partial<MobileDevice>): MobileDevice | null {
    const devices = this.mobileDevices();
    const index = devices.findIndex(d => d.id === deviceId);
    
    if (index === -1) return null;

    const updatedDevice = {
      ...devices[index],
      ...updates,
      updatedAt: new Date()
    };

    this.mobileDevices.update(devs => [...devs.slice(0, index), updatedDevice, ...devs.slice(index + 1)]);
    return updatedDevice;
  }

  // Push Notifications
  sendPushNotification(
    userId: string,
    type: PushNotification['type'],
    title: string,
    message: string,
    data?: any,
    deviceId?: string
  ): PushNotification {
    const notification: PushNotification = {
      id: uuid(),
      userId,
      deviceId,
      type,
      title,
      message,
      data,
      priority: 'normal',
      isRead: false,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.pushNotifications.update(notifications => [...notifications, notification]);
    
    // Actually send notification (would integrate with push service)
    this.deliverPushNotification(notification);
    
    return notification;
  }

  // Backup Management
  async createBackup(type: BackupRecord['type'] = 'full', name?: string): Promise<BackupRecord> {
    const backup: BackupRecord = {
      id: uuid(),
      name: name || `Backup ${new Date().toISOString()}`,
      type,
      size: 0,
      compressedSize: 0,
      location: 'both',
      status: 'in_progress',
      createdAt: new Date(),
      includes: ['products', 'customers', 'sales', 'inventory', 'employees'],
      checksum: '',
      encrypted: this.cloudSettings().encryptionEnabled
    };

    this.backupRecords.update(backups => [...backups, backup]);

    try {
      // Simulate backup process
      const backupData = await this.gatherBackupData(type);
      const compressedData = this.cloudSettings().compressionEnabled 
        ? await this.compressData(backupData)
        : backupData;

      const encryptedData = this.cloudSettings().encryptionEnabled
        ? await this.encryptData(compressedData)
        : compressedData;

      const checksum = await this.calculateChecksum(encryptedData);

      const completedBackup = {
        ...backup,
        size: backupData.length,
        compressedSize: compressedData.length,
        status: 'completed' as const,
        completedAt: new Date(),
        checksum
      };

      this.backupRecords.update(backups => 
        backups.map(b => b.id === backup.id ? completedBackup : b)
      );

      // Upload to cloud
      await this.uploadBackup(completedBackup.id, encryptedData);

      return completedBackup;

    } catch (error) {
      const failedBackup = {
        ...backup,
        status: 'failed' as const,
        completedAt: new Date()
      };

      this.backupRecords.update(backups => 
        backups.map(b => b.id === backup.id ? failedBackup : b)
      );

      throw error;
    }
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    const backup = this.backupRecords().find(b => b.id === backupId);
    if (!backup || backup.status !== 'completed') return false;

    try {
      // Download backup data
      const encryptedData = await this.downloadBackup(backupId);
      
      // Decrypt if needed
      const decryptedData = backup.encrypted 
        ? await this.decryptData(encryptedData)
        : encryptedData;

      // Decompress if needed
      const decompressedData = backup.compressedSize < backup.size
        ? await this.decompressData(decryptedData)
        : decryptedData;

      // Verify checksum
      const checksum = await this.calculateChecksum(decryptedData);
      if (checksum !== backup.checksum) {
        throw new Error('Backup checksum verification failed');
      }

      // Restore data
      await this.restoreBackupData(decompressedData);

      return true;

    } catch (error) {
      console.error('Backup restore failed:', error);
      return false;
    }
  }

  // Analytics
  getSyncAnalytics(dateRange: { start: Date; end: Date }): {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageSyncTime: number;
    dataTransferred: number;
    conflicts: number;
    devices: number;
    backups: number;
  } {
    const operations = this.syncOperations().filter(op => 
      op.createdAt >= dateRange.start && op.createdAt <= dateRange.end
    );

    const successfulSyncs = operations.filter(op => op.status === 'completed').length;
    const failedSyncs = operations.filter(op => op.status === 'failed').length;
    
    const averageSyncTime = successfulSyncs > 0
      ? operations
          .filter(op => op.status === 'completed' && op.startedAt && op.completedAt)
          .reduce((sum, op) => 
            sum + ((op.completedAt!.getTime() - op.startedAt!.getTime())), 0
          ) / successfulSyncs
      : 0;

    const dataTransferred = operations.reduce((sum, op) => 
      sum + (JSON.stringify(op.data).length * 2), 0
    ); // Rough estimate in bytes

    const conflicts = this.conflicts().filter(c => 
      c.createdAt >= dateRange.start && c.createdAt <= dateRange.end
    ).length;

    const devices = this.mobileDevices().filter(d => 
      d.lastSeen >= dateRange.start && d.lastSeen <= dateRange.end
    ).length;

    const backups = this.backupRecords().filter(b => 
      b.createdAt >= dateRange.start && b.createdAt <= dateRange.end
    ).length;

    return {
      totalSyncs: operations.length,
      successfulSyncs,
      failedSyncs,
      averageSyncTime,
      dataTransferred,
      conflicts,
      devices,
      backups
    };
  }

  // Private helper methods
  private initializeService(): void {
    // Monitor connection status
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));

    // Start auto-sync if enabled
    if (this.cloudSettings().autoSync) {
      this.startAutoSync();
    }

    // Load offline data from localStorage
    this.loadOfflineData();

    // Initialize mobile device
    this.initializeCurrentDevice();
  }

  private handleConnectionChange(isOnline: boolean): void {
    this.updateSyncStatus({ isOnline });

    if (isOnline && this.cloudSettings().autoSync) {
      this.startSync();
    }
  }

  private startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.syncStatus().isOnline && !this.syncStatus().syncInProgress) {
        this.startSync();
      }
    }, this.cloudSettings().syncInterval * 60 * 1000);
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch {
      return false;
    }
  }

  private queueSyncOperation(
    type: SyncOperation['type'],
    entityType: string,
    entityId: string,
    data: any,
    priority: SyncOperation['priority'] = 'normal'
  ): void {
    const operation: SyncOperation = {
      id: uuid(),
      type,
      entityType,
      entityId,
      data,
      status: 'pending',
      priority,
      retryCount: 0,
      maxRetries: this.cloudSettings().maxRetries,
      createdAt: new Date()
    };

    this.syncOperations.update(operations => [...operations, operation]);
    this.updatePendingCounts();
  }

  private async processUploads(): Promise<void> {
    const uploads = this.syncOperations()
      .filter(op => op.type === 'upload' && op.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    for (const upload of uploads.slice(0, this.cloudSettings().batchSize)) {
      await this.processSyncOperation(upload);
    }
  }

  private async processDownloads(): Promise<void> {
    const downloads = this.syncOperations()
      .filter(op => op.type === 'download' && op.status === 'pending')
      .slice(0, this.cloudSettings().batchSize);

    for (const download of downloads) {
      await this.processSyncOperation(download);
    }
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    // Update status to in_progress
    this.updateSyncOperationStatus(operation.id, 'in_progress');

    try {
      // Simulate sync operation
      await this.simulateSyncOperation(operation);

      // Update status to completed
      this.updateSyncOperationStatus(operation.id, 'completed');

      // Update offline data status
      if (operation.type === 'upload') {
        this.updateOfflineDataSyncStatus(operation.entityId, 'synced');
      }

    } catch (error) {
      if (operation.retryCount < operation.maxRetries) {
        // Retry later
        this.updateSyncOperationStatus(operation.id, 'pending');
        operation.retryCount++;
      } else {
        // Mark as failed
        this.updateSyncOperationStatus(
          operation.id, 
          'failed', 
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  private updateSyncOperationStatus(
    operationId: string,
    status: SyncOperation['status'],
    errorMessage?: string
  ): void {
    this.syncOperations.update(operations => 
      operations.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              status, 
              errorMessage,
              startedAt: status === 'in_progress' ? new Date() : op.startedAt,
              completedAt: status === 'completed' || status === 'failed' ? new Date() : op.completedAt
            }
          : op
      )
    );

    this.updatePendingCounts();
  }

  private updatePendingCounts(): void {
    const pendingUploads = this.syncOperations()
      .filter(op => op.type === 'upload' && op.status === 'pending').length;
    const pendingDownloads = this.syncOperations()
      .filter(op => op.type === 'download' && op.status === 'pending').length;

    this.updateSyncStatus({ pendingUploads, pendingDownloads });
  }

  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus.update(status => ({ ...status, ...updates }));
  }

  private updateOfflineDataSyncStatus(entityId: string, syncStatus: OfflineData['syncStatus']): void {
    this.offlineData.update(data => 
      data.map(d => d.entityId === entityId ? { ...d, syncStatus } : d)
    );
  }

  private async simulateSyncOperation(operation: SyncOperation): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }

    // Simulate conflicts (5% chance)
    if (Math.random() < 0.05 && operation.type === 'upload') {
      this.createConflict(operation);
    }
  }

  private createConflict(operation: SyncOperation): void {
    const conflict: ConflictResolution = {
      id: uuid(),
      operationId: operation.id,
      entityType: operation.entityType,
      entityId: operation.entityId,
      clientData: operation.data,
      serverData: { /* Simulated server data */ },
      conflictType: 'version_mismatch',
      createdAt: new Date()
    };

    this.conflicts.update(conflicts => [...conflicts, conflict]);
  }

  private async applyClientResolution(conflict: ConflictResolution): Promise<void> {
    // Apply client data to server
    console.log('Applying client resolution for conflict:', conflict.id);
  }

  private async applyServerResolution(conflict: ConflictResolution): Promise<void> {
    // Apply server data to client
    console.log('Applying server resolution for conflict:', conflict.id);
  }

  private async applyMergeResolution(conflict: ConflictResolution): Promise<void> {
    // Merge client and server data
    console.log('Applying merge resolution for conflict:', conflict.id);
  }

  private async deliverPushNotification(notification: PushNotification): Promise<void> {
    // This would integrate with actual push notification service
    console.log('Delivering push notification:', notification.title);
  }

  private async gatherBackupData(type: BackupRecord['type']): Promise<string> {
    // Gather all relevant data for backup
    const data = {
      offlineData: this.offlineData(),
      settings: this.cloudSettings(),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data);
  }

  private async compressData(data: string): Promise<string> {
    // Simulate compression (would use actual compression library)
    return data; // Placeholder
  }

  private async encryptData(data: string): Promise<string> {
    // Simulate encryption (would use actual encryption library)
    return btoa(data); // Simple base64 encoding as placeholder
  }

  private async decryptData(data: string): Promise<string> {
    // Simulate decryption
    return atob(data);
  }

  private async decompressData(data: string): Promise<string> {
    // Simulate decompression
    return data;
  }

  private async calculateChecksum(data: string): Promise<string> {
    // Simple checksum calculation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private async uploadBackup(backupId: string, data: string): Promise<void> {
    // Simulate cloud upload
    console.log(`Uploading backup ${backupId} to cloud`);
  }

  private async downloadBackup(backupId: string): Promise<string> {
    // Simulate cloud download
    console.log(`Downloading backup ${backupId} from cloud`);
    return '{}'; // Placeholder
  }

  private async restoreBackupData(data: string): Promise<void> {
    // Parse and restore backup data
    const backupData = JSON.parse(data);
    
    // Restore offline data
    if (backupData.offlineData) {
      this.offlineData.set(backupData.offlineData);
    }

    // Restore settings
    if (backupData.settings) {
      this.cloudSettings.set(backupData.settings);
    }
  }

  private loadOfflineData(): void {
    // Load from localStorage
    try {
      const stored = localStorage.getItem('pos_offline_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.offlineData.set(data.offlineData || []);
        this.cloudSettings.set(data.settings || this.cloudSettings());
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  private saveOfflineData(): void {
    // Save to localStorage
    try {
      const data = {
        offlineData: this.offlineData(),
        settings: this.cloudSettings()
      };
      localStorage.setItem('pos_offline_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  private initializeCurrentDevice(): void {
    const deviceInfo = {
      deviceId: this.generateDeviceId(),
      deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
      deviceType: navigator.userAgent.includes('Mobile') ? 'phone' as const : 'desktop' as const,
      platform: this.detectPlatform(),
      appVersion: '1.0.0',
      osVersion: navigator.userAgent,
      isActive: true,
      lastSeen: new Date(),
      capabilities: this.detectCapabilities(),
      settings: {
        notifications: 'Notification' in window,
        biometricAuth: false, // Would need specific API
        offlineMode: true,
        autoSync: true
      }
    };

    // Check if device already exists
    const existingDevice = this.mobileDevices().find(d => d.deviceId === deviceInfo.deviceId);
    if (!existingDevice) {
      this.registerDevice({ ...deviceInfo, userId: 'current_user' });
    } else {
      this.updateDevice(existingDevice.id, { lastSeen: new Date(), isActive: true });
    }
  }

  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('pos_device_id');
    if (!deviceId) {
      deviceId = uuid();
      localStorage.setItem('pos_device_id', deviceId);
    }
    return deviceId;
  }

  private detectPlatform(): MobileDevice['platform'] {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'ios';
    if (ua.includes('Android')) return 'android';
    if (ua.includes('Electron')) return 'desktop';
    return 'web';
  }

  private detectCapabilities(): string[] {
    const capabilities = [];
    if ('bluetooth' in navigator) capabilities.push('bluetooth');
    if ('usb' in navigator) capabilities.push('usb');
    if ('camera' in navigator.mediaDevices) capabilities.push('camera');
    if ('geolocation' in navigator) capabilities.push('geolocation');
    if ('serviceWorker' in navigator) capabilities.push('service_worker');
    if ('indexedDB' in window) capabilities.push('indexed_db');
    return capabilities;
  }
}
