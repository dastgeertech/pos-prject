import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndustryService, IndustryConfig, RetailSettings, RestaurantSettings, ServiceSettings, AppointmentServiceSettings } from '../../services/industry.service';
import { RestaurantSettingsComponent } from './components/restaurant-settings/restaurant-settings.component';
import { ServiceSettingsComponent } from './components/service-settings/service-settings.component';
import { RetailSettingsComponent } from './components/retail-settings/retail-settings.component';

@Component({
  selector: 'app-industry-features',
  standalone: true,
  imports: [CommonModule, FormsModule, RestaurantSettingsComponent, ServiceSettingsComponent, RetailSettingsComponent],
  templateUrl: './industry-features.component.html',
  styleUrls: ['./industry-features.component.scss']
})
export class IndustryFeaturesComponent implements OnInit {
  currentIndustry = signal<IndustryConfig | null>(null);
  selectedTab = signal<string>('overview');
  
  // Form models for different industry types
  retailForm = signal<Partial<RetailSettings>>({});
  restaurantForm = signal<Partial<RestaurantSettings>>({});
  serviceForm = signal<Partial<ServiceSettings | AppointmentServiceSettings>>({});
  
  // Computed properties
  isRetail = computed(() => this.currentIndustry()?.type === 'retail');
  isRestaurant = computed(() => this.currentIndustry()?.type === 'restaurant');
  isService = computed(() => this.currentIndustry()?.type === 'service');
  
  constructor(private industryService: IndustryService) {}

  ngOnInit() {
    this.loadCurrentIndustry();
  }

  private loadCurrentIndustry() {
    const activeConfig = this.industryService.currentIndustry$();
    if (activeConfig) {
      this.currentIndustry.set(activeConfig);
      this.initializeForms(activeConfig);
    }
  }

  private initializeForms(config: IndustryConfig) {
    switch (config.type) {
      case 'retail':
        this.retailForm.set(config.settings.retail || {});
        break;
      case 'restaurant':
        this.restaurantForm.set(config.settings.restaurant || {});
        break;
      case 'service':
        // Handle both ServiceSettings and AppointmentServiceSettings
        const serviceSettings = config.settings.service;
        this.serviceForm.set(serviceSettings || {});
        break;
    }
  }

  selectTab(tab: string) {
    this.selectedTab.set(tab);
  }

  saveRetailSettings() {
    if (this.currentIndustry()) {
      const retailForm = this.retailForm();
      // Ensure all required properties are defined with default values if missing
      const retailSettings: RetailSettings = {
        productTypes: retailForm.productTypes || [],
        pricingStrategies: retailForm.pricingStrategies || [],
        promotions: retailForm.promotions || {
          enabled: false,
          types: [],
          autoApply: false,
          stackable: false,
          maxDiscounts: 0,
          requireCoupon: false
        },
        returns: retailForm.returns || {
          enabled: false,
          timeLimit: 0,
          requireReceipt: false,
          restockFee: 0,
          exchangeOnly: false,
          storeCreditOnly: false
        },
        giftCards: retailForm.giftCards || {
          enabled: false,
          types: [],
          expiryEnabled: false,
          expiryDays: 0,
          reloadable: false,
          minAmount: 0,
          maxAmount: 0
        },
        loyalty: retailForm.loyalty || {
          enabled: false,
          pointsPerDollar: 0,
          redemptionRate: 0,
          tiers: [],
          birthdayBonus: 0,
          referralBonus: 0
        }
      };
      
      const updatedConfig = {
        ...this.currentIndustry()!,
        settings: {
          ...this.currentIndustry()!.settings,
          retail: retailSettings
        }
      };
      this.industryService.updateIndustryConfig(updatedConfig.id, updatedConfig);
      this.currentIndustry.set(updatedConfig);
    }
  }

  saveRestaurantSettings() {
    if (this.currentIndustry()) {
      const restaurantForm = this.restaurantForm();
      // Ensure tableManagement is always defined with default values if missing
      const restaurantSettings: RestaurantSettings = {
        tableManagement: restaurantForm.tableManagement || {
          enabled: false,
          tableLayout: [],
          floorPlan: {
            id: '',
            name: '',
            dimensions: { width: 0, height: 0 },
            tables: [],
            zones: []
          },
          autoAssign: false,
          tableTurnTime: 60,
          maxCapacity: 100
        },
        menuManagement: restaurantForm.menuManagement || {
          categories: [],
          modifiers: [],
          combos: [],
          specials: [],
          pricing: {
            happyHour: { enabled: false, startTime: '', endTime: '', daysOfWeek: [], discount: 0, applicableItems: [] },
            timeBasedPricing: [],
            seasonalPricing: []
          }
        },
        kitchen: restaurantForm.kitchen || {
          displaySystem: 'printer',
          orderRouting: { rules: [], defaultStation: '', priorityRules: [] },
          prepTime: { enabled: false, defaultTimes: {}, rushMultiplier: 1, complexityFactors: [] },
          inventory: { trackIngredients: false, autoDeduct: false, lowStockAlerts: false, recipeManagement: false }
        },
        service: restaurantForm.service || {
          tipOptions: [],
          serviceCharge: { enabled: false, percentage: 0, applicableParties: 0, autoApply: false },
          serverTracking: { trackSales: false, trackTips: false, trackTables: false, performanceMetrics: [] }
        },
        delivery: restaurantForm.delivery || { enabled: false, zones: [], fees: { baseFee: 0, distanceFee: 0, timeFee: 0, weatherMultiplier: 1, rushHourMultiplier: 1 }, tracking: { enabled: false, customerNotifications: false, realTimeTracking: false, estimatedAccuracy: 0 }, drivers: { tracking: false, autoAssign: false, performanceMetrics: [], paymentMethod: 'hourly' } },
        reservations: restaurantForm.reservations || { enabled: false, maxPartySize: 0, advanceBooking: 0, confirmationRequired: false, depositRequired: false, depositAmount: 0, cancellationPolicy: { timeLimit: 0, fee: 0, feeType: 'fixed', noShowFee: 0 } }
      };
      
      const updatedConfig = {
        ...this.currentIndustry()!,
        settings: {
          ...this.currentIndustry()!.settings,
          restaurant: restaurantSettings
        }
      };
      this.industryService.updateIndustryConfig(updatedConfig.id, updatedConfig);
      this.currentIndustry.set(updatedConfig);
    }
  }

  saveServiceSettings() {
    if (this.currentIndustry()) {
      const serviceForm = this.serviceForm();
      
      // Check if it's AppointmentServiceSettings or ServiceSettings
      if ('appointments' in serviceForm) {
        // It's AppointmentServiceSettings
        const appointmentSettings: AppointmentServiceSettings = {
          appointments: serviceForm.appointments || {
            duration: 60,
            bufferTime: 15,
            advanceBooking: 24,
            cancellationPolicy: {
              timeLimit: 24,
              fee: 0,
              feeType: 'percentage',
              noShowFee: 0
            },
            confirmationRequired: false,
            depositRequired: false,
            depositAmount: 0
          },
          scheduling: serviceForm.scheduling || {
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
          },
          resources: serviceForm.resources || {
            resources: [],
            scheduling: {
              autoAssign: false,
              conflictDetection: true,
              optimizationEnabled: false,
              utilizationTarget: 80
            },
            utilization: {
              trackingEnabled: false,
              reportingFrequency: 'weekly',
              alerts: []
            }
          },
          pricing: serviceForm.pricing || {
            strategies: [],
            packages: [],
            discounts: []
          },
          notifications: serviceForm.notifications || {
            reminders: {
              enabled: false,
              timing: [24],
              channels: ['email'],
              template: ''
            },
            confirmations: {
              enabled: false,
              timing: 2,
              channels: ['email'],
              requireResponse: false
            },
            marketing: {
              enabled: false,
              promotions: false,
              newsletters: false,
              frequency: 'monthly',
              consentRequired: true
            }
          }
        };
        
        const updatedConfig = {
          ...this.currentIndustry()!,
          settings: {
            ...this.currentIndustry()!.settings,
            service: appointmentSettings
          }
        };
        this.industryService.updateIndustryConfig(updatedConfig.id, updatedConfig);
        this.currentIndustry.set(updatedConfig);
      } else {
        // It's basic ServiceSettings
        const serviceFormTyped = serviceForm as Partial<ServiceSettings>;
        const serviceSettings: ServiceSettings = {
          tipOptions: serviceFormTyped.tipOptions || [
            { percentage: 15, label: 'Good', isDefault: true },
            { percentage: 18, label: 'Great', isDefault: false },
            { percentage: 20, label: 'Excellent', isDefault: false }
          ],
          serviceCharge: serviceFormTyped.serviceCharge || { enabled: false, percentage: 15, applicableParties: 6, autoApply: false },
          serverTracking: serviceFormTyped.serverTracking || { trackSales: false, trackTips: false, trackTables: false, performanceMetrics: [] }
        };
        
        const updatedConfig = {
          ...this.currentIndustry()!,
          settings: {
            ...this.currentIndustry()!.settings,
            service: serviceSettings
          }
        };
        this.industryService.updateIndustryConfig(updatedConfig.id, updatedConfig);
        this.currentIndustry.set(updatedConfig);
      }
    }
  }

  // Helper methods for form handling
  updateRetailForm<K extends keyof RetailSettings>(key: K, value: RetailSettings[K]) {
    this.retailForm.set({ ...this.retailForm(), [key]: value });
  }

  updateRestaurantForm<K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) {
    this.restaurantForm.set({ ...this.restaurantForm(), [key]: value });
  }

  updateServiceForm<K extends keyof (ServiceSettings | AppointmentServiceSettings)>(key: K, value: any) {
    const currentForm = this.serviceForm();
    this.serviceForm.set({ ...currentForm, [key]: value });
  }

  handleServiceUpdate(event: { key: string; value: any }) {
    if (event && event.key && event.value !== undefined) {
      // Cast to any to handle the union type
      this.updateServiceForm(event.key as keyof (ServiceSettings | AppointmentServiceSettings), event.value);
    }
  }

  // Tab configuration
  getTabs() {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: '📋' },
      { id: 'analytics', label: 'Analytics', icon: '📊' }
    ];

    if (this.isRetail()) {
      baseTabs.splice(1, 0, { id: 'retail', label: 'Retail Settings', icon: '🛍️' });
    } else if (this.isRestaurant()) {
      baseTabs.splice(1, 0, { id: 'restaurant', label: 'Restaurant Settings', icon: '🍽️' });
    } else if (this.isService()) {
      baseTabs.splice(1, 0, { id: 'service', label: 'Service Settings', icon: '🔧' });
    }

    return baseTabs;
  }

  getTabClass(tabId: string) {
    const isActive = this.selectedTab() === tabId;
    return `
      relative flex-1 text-sm font-medium rounded-md py-2 px-3 transition-colors
      ${isActive 
        ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' 
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      }
    `;
  }
}