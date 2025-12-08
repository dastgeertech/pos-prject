import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndustryConfig, RestaurantSettings, TableManagementSettings, MenuManagementSettings, DeliverySettings, ReservationSettings } from '../../../../services/industry.service';

@Component({
  selector: 'app-restaurant-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-settings.component.html',
  styleUrls: ['./restaurant-settings.component.scss']
})
export class RestaurantSettingsComponent {
  @Input() config: IndustryConfig | null = null;
  @Input() formData: Partial<RestaurantSettings> = {};
  @Output() save = new EventEmitter<void>();
  @Output() update = new EventEmitter<{ key: keyof RestaurantSettings; value: any }>();

  // Sample data for demonstration
  tableTypes = ['Booth', 'Table', 'Bar', 'Outdoor'];
  menuCategories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Specials'];
  deliveryZones = ['Downtown', 'Midtown', 'Uptown', 'Suburbs'];

  updateField<K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) {
    this.update.emit({ key, value });
  }

  // Helper methods for complex objects
  updateTableManagement(updates: Partial<TableManagementSettings>) {
    const current = this.formData.tableManagement || {
      enabled: false,
      tableLayout: [],
      floorPlan: {
        id: 'default',
        name: 'Main Floor',
        dimensions: { width: 100, height: 100 },
        width: 100,
        height: 100,
        tables: [],
        zones: []
      },
      autoAssign: false,
      tableTurnTime: 30,
      maxCapacity: 100
    };
    this.updateField('tableManagement', { ...current, ...updates });
  }

  updateMenuManagement(updates: Partial<MenuManagementSettings>) {
    const current = this.formData.menuManagement || {
      categories: [],
      modifiers: [],
      combos: [],
      specials: [],
      pricing: {
        happyHour: {
          enabled: false,
          startTime: '17:00',
          endTime: '19:00',
          daysOfWeek: [1, 2, 3, 4, 5],
          discount: 20,
          applicableItems: []
        },
        timeBasedPricing: [],
        seasonalPricing: []
      }
    };
    this.updateField('menuManagement', { ...current, ...updates });
  }

  updateDeliverySettings(updates: Partial<DeliverySettings>) {
    const current = this.formData.delivery || {
      enabled: false,
      zones: [],
      fees: {
        baseFee: 5,
        distanceFee: 0.5,
        timeFee: 0,
        weatherMultiplier: 1.2,
        rushHourMultiplier: 1.5
      },
      tracking: {
        enabled: false,
        customerNotifications: false,
        realTimeTracking: false,
        estimatedAccuracy: 5
      },
      drivers: {
        tracking: false,
        autoAssign: false,
        performanceMetrics: [],
        paymentMethod: 'per_delivery'
      }
    };
    this.updateField('delivery', { ...current, ...updates });
  }

  updateReservationSettings(updates: Partial<ReservationSettings>) {
    const current = this.formData.reservations || {
      enabled: false,
      maxPartySize: 20,
      advanceBooking: 30,
      confirmationRequired: false,
      depositRequired: false,
      depositAmount: 0,
      cancellationPolicy: {
        timeLimit: 24,
        fee: 0,
        feeType: 'percentage',
        noShowFee: 0
      }
    };
    this.updateField('reservations', { ...current, ...updates });
  }

  // Toggle methods
  toggleTableManagement(enabled: boolean) {
    this.updateTableManagement({ enabled });
  }

  toggleDelivery(enabled: boolean) {
    this.updateDeliverySettings({ enabled });
  }

  toggleReservations(enabled: boolean) {
    this.updateReservationSettings({ enabled });
  }
}