import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndustryConfig, ServiceSettings, AppointmentServiceSettings, AppointmentSettings, SchedulingSettings, ResourceSettings, ServicePricingSettings } from '../../../../services/industry.service';

@Component({
  selector: 'app-service-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-settings.component.html',
  styleUrls: ['./service-settings.component.scss']
})
export class ServiceSettingsComponent {
  @Input() config: IndustryConfig | null = null;
  @Input() formData: Partial<ServiceSettings | AppointmentServiceSettings> = {};
  @Output() save = new EventEmitter<void>();
  @Output() update = new EventEmitter<{ key: keyof (ServiceSettings | AppointmentServiceSettings); value: any }>();

  // Sample data for demonstration
  serviceTypes = ['Consultation', 'Repair', 'Maintenance', 'Installation', 'Training'];
  resourceTypes = ['Room', 'Equipment', 'Vehicle', 'Person'];
  pricingStrategies = ['Hourly', 'Fixed', 'Package', 'Subscription'];

  updateField<K extends keyof (ServiceSettings | AppointmentServiceSettings)>(key: K, value: any) {
    this.update.emit({ key, value });
  }

  // Helper methods for complex objects
  updateAppointmentSettings(updates: Partial<AppointmentSettings>) {
    if (!('appointments' in this.formData)) return;
    const current = (this.formData as AppointmentServiceSettings).appointments || {
      duration: 60,
      bufferTime: 15,
      advanceBooking: 24,
      cancellationPolicy: {
        timeLimit: 24,
        fee: 0,
        feeType: 'percentage' as const,
        noShowFee: 0
      },
      confirmationRequired: false,
      depositRequired: false,
      depositAmount: 0
    };
    this.updateField('appointments' as keyof (ServiceSettings | AppointmentServiceSettings), { ...current, ...updates });
  }

  updateResourceSettings(updates: Partial<ResourceSettings>) {
    if (!('resources' in this.formData)) return;
    const current = (this.formData as AppointmentServiceSettings).resources || {
      resources: [],
      scheduling: {
        autoAssign: false,
        conflictDetection: true,
        optimizationEnabled: false,
        utilizationTarget: 80
      },
      utilization: {
        trackingEnabled: false,
        reportingFrequency: 'weekly' as const,
        alerts: []
      }
    };
    this.updateField('resources' as keyof (ServiceSettings | AppointmentServiceSettings), { ...current, ...updates });
  }

  updatePricingSettings(updates: Partial<ServicePricingSettings>) {
    if (!('pricing' in this.formData)) return;
    const current = (this.formData as AppointmentServiceSettings).pricing || {
      strategies: [],
      packages: [],
      discounts: []
    };
    this.updateField('pricing' as keyof (ServiceSettings | AppointmentServiceSettings), { ...current, ...updates });
  }

  updateSchedulingSettings(updates: Partial<SchedulingSettings>) {
    if (!('scheduling' in this.formData)) return;
    const current = (this.formData as AppointmentServiceSettings).scheduling || {
      businessHours: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: { open: '09:00', close: '17:00' }
      },
      breaks: [],
      holidays: [],
      maxAppointments: 20,
      overlapAllowed: false
    };
    this.updateField('scheduling' as keyof (ServiceSettings | AppointmentServiceSettings), { ...current, ...updates });
  }

  // Toggle methods
  toggleAppointments(enabled: boolean) {
    this.updateAppointmentSettings({ 
      confirmationRequired: enabled,
      depositRequired: enabled
    } as AppointmentSettings);
  }

  toggleResourceTracking(enabled: boolean) {
    this.updateResourceSettings({ 
      scheduling: { 
        autoAssign: enabled,
        conflictDetection: enabled,
        optimizationEnabled: enabled,
        utilizationTarget: 80
      }
    });
  }
}