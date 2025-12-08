import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CloudSyncService, SyncStatus, SyncOperation, ConflictResolution, CloudSettings, MobileDevice, PushNotification, BackupRecord } from '../../services/cloud-sync.service';

@Component({
  selector: 'app-cloud-features',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cloud-features.component.html',
  styleUrls: ['./cloud-features.component.scss']
})
export class CloudFeaturesComponent implements OnInit {
  selectedTab = signal<string>('sync-status');
  
  // Service signals
  syncStatus = computed(() => this.cloudSyncService.syncStatus$());
  syncOperations = computed(() => this.cloudSyncService.syncOperations$());
  conflicts = computed(() => this.cloudSyncService.conflicts$());
  cloudSettings = computed(() => this.cloudSyncService.cloudSettings$());
  mobileDevices = computed(() => this.cloudSyncService.mobileDevices$());
  pushNotifications = computed(() => this.cloudSyncService.pushNotifications$());
  backupRecords = computed(() => this.cloudSyncService.backupRecords$());
  
  // Form models
  settingsForm = signal<Partial<CloudSettings>>({});
  
  // UI state
  isSyncing = signal(false);
  selectedConflict = signal<ConflictResolution | null>(null);
  selectedDevice = signal<MobileDevice | null>(null);
  selectedBackup = signal<BackupRecord | null>(null);
  
  constructor(private cloudSyncService: CloudSyncService) {}
  
  ngOnInit() {
    this.initializeForm();
  }
  
  private initializeForm() {
    this.settingsForm.set({ ...this.cloudSettings() });
  }
  
  // Sync operations
  startSync() {
    this.isSyncing.set(true);
    this.cloudSyncService.startSync().finally(() => {
      this.isSyncing.set(false);
    });
  }
  
  pauseSync() {
    this.cloudSyncService.pauseSync();
  }
  
  retryOperation(operationId: string) {
    this.cloudSyncService.retryOperation(operationId);
  }
  
  cancelOperation(operationId: string) {
    this.cloudSyncService.cancelOperation(operationId);
  }
  
  // Conflict resolution
  selectConflict(conflict: ConflictResolution) {
    this.selectedConflict.set(conflict);
  }
  
  resolveConflict(resolution: 'client' | 'server' | 'merge') {
    const conflict = this.selectedConflict();
    if (conflict) {
      this.cloudSyncService.resolveConflict(conflict.id, resolution, 'current-user').then(() => {
        this.selectedConflict.set(null);
      });
    }
  }
  
  // Settings
  saveSettings() {
    this.cloudSyncService.updateSettings(this.settingsForm());
  }
  
  // Device management
  selectDevice(device: MobileDevice) {
    this.selectedDevice.set(device);
  }
  
  updateDeviceSettings(settings: Partial<MobileDevice['settings']>) {
    const device = this.selectedDevice();
    if (device) {
      this.cloudSyncService.updateDeviceSettings(device.id, settings);
      this.selectedDevice.set(null);
    }
  }
  
  // Backup management
  selectBackup(backup: BackupRecord) {
    this.selectedBackup.set(backup);
  }
  
  createBackup(type: BackupRecord['type']) {
    this.cloudSyncService.createBackup(type);
  }
  
  restoreBackup(backupId: string) {
    this.cloudSyncService.restoreBackup(backupId);
  }
  
  deleteBackup(backupId: string) {
    this.cloudSyncService.deleteBackup(backupId);
  }
  
  // Push notifications
  markNotificationAsRead(notificationId: string) {
    this.cloudSyncService.markNotificationAsRead(notificationId);
  }
  
  clearAllNotifications() {
    this.cloudSyncService.clearAllNotifications();
  }
  
  // Helper methods for UI
  getSyncStatusIcon(status: SyncStatus) {
    if (status.syncInProgress) return '🔄';
    if (!status.isOnline) return '📴';
    if (status.pendingUploads > 0 || status.pendingDownloads > 0) return '⚠️';
    if (status.syncErrors.length > 0) return '❌';
    return '✅';
  }
  
  getSyncStatusText(status: SyncStatus) {
    if (status.syncInProgress) return 'Syncing...';
    if (!status.isOnline) return 'Offline';
    if (status.pendingUploads > 0 || status.pendingDownloads > 0) return 'Pending Changes';
    if (status.syncErrors.length > 0) return 'Sync Errors';
    return 'Synced';
  }
  
  getOperationStatusIcon(status: SyncOperation['status']) {
    const icons = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      failed: '❌',
      cancelled: '🚫'
    };
    return icons[status] || '❓';
  }
  
  getOperationPriorityIcon(priority: SyncOperation['priority']) {
    const icons = {
      low: '⬇️',
      normal: '➡️',
      high: '⬆️',
      critical: '🔥'
    };
    return icons[priority] || '❓';
  }
  
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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