import { Injectable, signal, computed } from '@angular/core';
import { v4 as uuid } from 'uuid';

// Base Industry Interface
export interface IndustryConfig {
  id: string;
  name: string;
  type: 'retail' | 'restaurant' | 'service';
  features: string[];
  settings: IndustrySettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndustrySettings {
  // Common settings
  taxRates: Record<string, number>;
  paymentMethods: string[];
  receiptOptions: ReceiptOptions;
  inventorySettings: InventorySettings;
  customerSettings: CustomerSettings;
  
  // Industry-specific settings
  retail?: RetailSettings;
  restaurant?: RestaurantSettings;
  service?: ServiceSettings;
}

export interface ReceiptOptions {
  showLogo: boolean;
  showCustomerInfo: boolean;
  showTaxBreakdown: boolean;
  showDiscounts: boolean;
  showLoyaltyPoints: boolean;
  showBarcode: boolean;
  customHeader?: string;
  customFooter?: string;
}

export interface InventorySettings {
  trackStock: boolean;
  lowStockAlerts: boolean;
  autoReorder: boolean;
  batchTracking: boolean;
  expiryTracking: boolean;
  categories: string[];
}

export interface CustomerSettings {
  requireCustomerInfo: boolean;
  loyaltyProgram: boolean;
  customerAccounts: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
}

// Retail-specific interfaces
export interface RetailSettings {
  productTypes: string[];
  pricingStrategies: PricingStrategy[];
  promotions: PromotionSettings;
  returns: ReturnSettings;
  giftCards: GiftCardSettings;
  loyalty: RetailLoyaltySettings;
}

export interface PricingStrategy {
  id: string;
  name: string;
  type: 'fixed' | 'cost_plus' | 'competitive' | 'dynamic' | 'bundle';
  parameters: Record<string, any>;
  isActive: boolean;
}

export interface PromotionSettings {
  enabled: boolean;
  types: string[];
  autoApply: boolean;
  stackable: boolean;
  maxDiscounts: number;
  requireCoupon: boolean;
}

export interface ReturnSettings {
  enabled: boolean;
  timeLimit: number; // days
  requireReceipt: boolean;
  restockFee: number; // percentage
  exchangeOnly: boolean;
  storeCreditOnly: boolean;
}

export interface GiftCardSettings {
  enabled: boolean;
  types: string[];
  expiryEnabled: boolean;
  expiryDays: number;
  reloadable: boolean;
  minAmount: number;
  maxAmount: number;
}

export interface RetailLoyaltySettings {
  enabled: boolean;
  pointsPerDollar: number;
  redemptionRate: number;
  tiers: LoyaltyTier[];
  birthdayBonus: number;
  referralBonus: number;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  discountRate: number;
  pointsMultiplier: number;
}

// Restaurant-specific interfaces
export interface RestaurantSettings {
  tableManagement: TableManagementSettings;
  menuManagement: MenuManagementSettings;
  kitchen: KitchenSettings;
  service: ServiceSettings;
  delivery: DeliverySettings;
  reservations: ReservationSettings;
}

export interface TableManagementSettings {
  enabled: boolean;
  tableLayout: TableLayout[];
  floorPlan: FloorPlan;
  autoAssign: boolean;
  tableTurnTime: number; // minutes
  maxCapacity: number;
}

export interface TableLayout {
  id: string;
  number: string;
  capacity: number;
  type: 'booth' | 'table' | 'bar' | 'outdoor';
  position: { x: number; y: number };
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  serverId?: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  dimensions: { width: number; height: number };
  tables: TableLayout[];
  zones: Zone[];
}

export interface Zone {
  id: string;
  name: string;
  tables: string[];
  serverId?: string;
  priority: number;
}

export interface MenuManagementSettings {
  categories: MenuCategory[];
  modifiers: MenuModifier[];
  combos: MenuCombo[];
  specials: MenuSpecial[];
  pricing: MenuPricingSettings;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  items: string[];
}

export interface MenuModifier {
  id: string;
  name: string;
  type: 'option' | 'required' | 'extra';
  price: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

export interface MenuCombo {
  id: string;
  name: string;
  description: string;
  price: number;
  items: ComboItem[];
  isActive: boolean;
}

export interface ComboItem {
  categoryId: string;
  required: boolean;
  maxSelections: number;
  items: string[];
}

export interface MenuSpecial {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  specialPrice: number;
  startTime: Date;
  endTime: Date;
  daysOfWeek: number[];
  isActive: boolean;
}

export interface MenuPricingSettings {
  happyHour: HappyHourSettings;
  timeBasedPricing: TimeBasedPricing[];
  seasonalPricing: SeasonalPricing[];
}

export interface HappyHourSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  discount: number; // percentage
  applicableItems: string[];
}

export interface TimeBasedPricing {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  priceAdjustment: number; // percentage
  applicableItems: string[];
}

export interface SeasonalPricing {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  priceAdjustment: number; // percentage
  applicableItems: string[];
}

export interface KitchenSettings {
  displaySystem: 'kds' | 'printer' | 'both';
  orderRouting: OrderRouting;
  prepTime: PrepTimeSettings;
  inventory: KitchenInventorySettings;
}

export interface OrderRouting {
  rules: RoutingRule[];
  defaultStation: string;
  priorityRules: PriorityRule[];
}

export interface RoutingRule {
  id: string;
  condition: string;
  destination: string;
  priority: number;
}

export interface PriorityRule {
  id: string;
  condition: string;
  priority: number;
  reason: string;
}

export interface PrepTimeSettings {
  enabled: boolean;
  defaultTimes: Record<string, number>; // category -> minutes
  rushMultiplier: number;
  complexityFactors: ComplexityFactor[];
}

export interface ComplexityFactor {
  id: string;
  name: string;
  multiplier: number;
  applicableItems: string[];
}

export interface KitchenInventorySettings {
  trackIngredients: boolean;
  autoDeduct: boolean;
  lowStockAlerts: boolean;
  recipeManagement: boolean;
}

export interface ServiceSettings {
  tipOptions: TipOption[];
  serviceCharge: ServiceChargeSettings;
  serverTracking: ServerTrackingSettings;
}

export interface TipOption {
  percentage: number;
  label: string;
  isDefault: boolean;
}

export interface ServiceChargeSettings {
  enabled: boolean;
  percentage: number;
  applicableParties: number;
  autoApply: boolean;
}

export interface ServerTrackingSettings {
  trackSales: boolean;
  trackTips: boolean;
  trackTables: boolean;
  performanceMetrics: string[];
}

export interface DeliverySettings {
  enabled: boolean;
  zones: DeliveryZone[];
  fees: DeliveryFeeSettings;
  tracking: DeliveryTrackingSettings;
  drivers: DriverSettings;
}

export interface DeliveryZone {
  id: string;
  name: string;
  boundaries: string; // Could be polygon coordinates
  minOrder: number;
  deliveryFee: number;
  estimatedTime: number; // minutes
  isActive: boolean;
}

export interface DeliveryFeeSettings {
  baseFee: number;
  distanceFee: number; // per mile/km
  timeFee: number; // per minute
  weatherMultiplier: number;
  rushHourMultiplier: number;
}

export interface DeliveryTrackingSettings {
  enabled: boolean;
  customerNotifications: boolean;
  realTimeTracking: boolean;
  estimatedAccuracy: number; // minutes
}

export interface DriverSettings {
  tracking: boolean;
  autoAssign: boolean;
  performanceMetrics: string[];
  paymentMethod: 'hourly' | 'per_delivery' | 'hybrid';
}

export interface ReservationSettings {
  enabled: boolean;
  maxPartySize: number;
  advanceBooking: number; // days
  confirmationRequired: boolean;
  depositRequired: boolean;
  depositAmount: number;
  cancellationPolicy: CancellationPolicy;
}

export interface CancellationPolicy {
  timeLimit: number; // hours before reservation
  fee: number; // percentage or fixed amount
  feeType: 'percentage' | 'fixed';
  noShowFee: number;
}

// Service-specific interfaces
export interface ServiceSettings {
  appointments: AppointmentSettings;
  scheduling: SchedulingSettings;
  resources: ResourceSettings;
  pricing: ServicePricingSettings;
  notifications: NotificationSettings;
}

export interface AppointmentSettings {
  duration: number; // default minutes
  bufferTime: number; // minutes between appointments
  advanceBooking: number; // days
  cancellationPolicy: ServiceCancellationPolicy;
  confirmationRequired: boolean;
  depositRequired: boolean;
  depositAmount: number;
}

export interface ServiceCancellationPolicy {
  timeLimit: number; // hours before appointment
  fee: number;
  feeType: 'percentage' | 'fixed';
  noShowFee: number;
}

export interface SchedulingSettings {
  businessHours: BusinessHours;
  breaks: Break[];
  holidays: Holiday[];
  maxAppointments: number;
  overlapAllowed: boolean;
}

export interface BusinessHours {
  [key: string]: { open: string; close: string; closed?: boolean };
}

export interface Break {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  recurring: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  recurring: boolean;
  closed: boolean;
}

export interface ResourceSettings {
  resources: ServiceResource[];
  scheduling: ResourceSchedulingSettings;
  utilization: UtilizationSettings;
}

export interface ServiceResource {
  id: string;
  name: string;
  type: 'room' | 'equipment' | 'vehicle' | 'person';
  capacity: number;
  location?: string;
  status: 'available' | 'busy' | 'maintenance' | 'unavailable';
  schedule: ResourceSchedule[];
  skills?: string[];
}

export interface ResourceSchedule {
  id: string;
  resourceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  appointmentId?: string;
  status: 'available' | 'booked' | 'blocked';
}

export interface ResourceSchedulingSettings {
  autoAssign: boolean;
  conflictDetection: boolean;
  optimizationEnabled: boolean;
  utilizationTarget: number; // percentage
}

export interface UtilizationSettings {
  trackingEnabled: boolean;
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
  alerts: UtilizationAlert[];
}

export interface UtilizationAlert {
  type: 'underutilized' | 'overutilized' | 'conflict';
  threshold: number;
  enabled: boolean;
}

export interface ServicePricingSettings {
  strategies: ServicePricingStrategy[];
  packages: ServicePackage[];
  discounts: ServiceDiscount[];
}

export interface ServicePricingStrategy {
  id: string;
  name: string;
  type: 'fixed' | 'hourly' | 'per_person' | 'tiered' | 'dynamic';
  baseRate: number;
  parameters: Record<string, any>;
  applicableServices: string[];
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: string[];
  price: number;
  duration: number;
  savings: number; // percentage
  isActive: boolean;
}

export interface ServiceDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bundle';
  value: number;
  conditions: DiscountCondition[];
  isActive: boolean;
}

export interface DiscountCondition {
  type: 'new_customer' | 'loyalty' | 'volume' | 'time' | 'service';
  value: any;
}

export interface NotificationSettings {
  reminders: ReminderSettings;
  confirmations: ConfirmationSettings;
  marketing: MarketingNotificationSettings;
}

export interface ReminderSettings {
  enabled: boolean;
  timing: number[]; // hours before appointment
  channels: ('email' | 'sms' | 'push')[];
  template: string;
}

export interface ConfirmationSettings {
  enabled: boolean;
  timing: number; // minutes after booking
  channels: ('email' | 'sms')[];
  requireResponse: boolean;
}

export interface MarketingNotificationSettings {
  enabled: boolean;
  promotions: boolean;
  newsletters: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  consentRequired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class IndustryService {
  private industryConfigs = signal<IndustryConfig[]>([]);
  private currentIndustry = signal<IndustryConfig | null>(null);

  // Computed signals
  industryConfigs$ = computed(() => this.industryConfigs());
  currentIndustry$ = computed(() => this.currentIndustry());

  constructor() {
    this.initializeIndustryConfigs();
  }

  // Industry Management
  createIndustryConfig(configData: Omit<IndustryConfig, 'id' | 'createdAt' | 'updatedAt'>): IndustryConfig {
    const config: IndustryConfig = {
      id: uuid(),
      ...configData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.industryConfigs.update(configs => [...configs, config]);
    return config;
  }

  updateIndustryConfig(configId: string, updates: Partial<IndustryConfig>): IndustryConfig | null {
    const configs = this.industryConfigs();
    const index = configs.findIndex(c => c.id === configId);
    
    if (index === -1) return null;

    const updatedConfig = {
      ...configs[index],
      ...updates,
      updatedAt: new Date()
    };

    this.industryConfigs.update(confs => [...confs.slice(0, index), updatedConfig, ...confs.slice(index + 1)]);
    return updatedConfig;
  }

  setActiveIndustry(configId: string): boolean {
    const config = this.industryConfigs().find(c => c.id === configId);
    if (!config) return false;

    this.currentIndustry.set(config);
    return true;
  }

  // Retail-specific methods
  createPricingStrategy(
    industryId: string,
    strategy: Omit<PricingStrategy, 'id'>
  ): PricingStrategy | null {
    const config = this.industryConfigs().find(c => c.id === industryId && c.type === 'retail');
    if (!config || !config.settings.retail) return null;

    const newStrategy: PricingStrategy = {
      id: uuid(),
      ...strategy
    };

    config.settings.retail.pricingStrategies.push(newStrategy);
    this.updateIndustryConfig(industryId, config);
    
    return newStrategy;
  }

  calculateRetailPrice(
    industryId: string,
    baseCost: number,
    strategyId: string,
    context?: Record<string, any>
  ): number {
    const config = this.industryConfigs().find(c => c.id === industryId && c.type === 'retail');
    if (!config || !config.settings.retail) return baseCost;

    const strategy = config.settings.retail.pricingStrategies.find(s => s.id === strategyId);
    if (!strategy) return baseCost;

    switch (strategy.type) {
      case 'fixed':
        return strategy.parameters['price'] || baseCost;
      
      case 'cost_plus':
        const markup = strategy.parameters['markup'] || 1.5;
        return baseCost * markup;
      
      case 'competitive':
        return strategy.parameters['targetPrice'] || baseCost;
      
      case 'dynamic':
        return this.calculateDynamicPrice(baseCost, strategy, context);
      
      case 'bundle':
        return baseCost * (strategy.parameters['bundleDiscount'] || 0.9);
      
      default:
        return baseCost;
    }
  }

  private calculateDynamicPrice(
    baseCost: number,
    strategy: PricingStrategy,
    context?: Record<string, any>
  ): number {
    let price = baseCost;
    
    // Demand-based adjustment
    if (context?.['demand']) {
      const demandMultiplier = 1 + (context['demand'] - 0.5) * 0.3;
      price *= demandMultiplier;
    }
    
    // Time-based adjustment
    if (context?.['timeOfDay']) {
      const hour = new Date(context['timeOfDay']).getHours();
      if (hour >= 18 && hour <= 21) { // Peak hours
        price *= 1.1;
      }
    }
    
    // Inventory-based adjustment
    if (context?.['stockLevel']) {
      if (context['stockLevel'] < 10) { // Low stock
        price *= 1.05;
      } else if (context['stockLevel'] > 100) { // High stock
        price *= 0.95;
      }
    }
    
    return Math.round(price * 100) / 100;
  }

  // Restaurant-specific methods
  createTableLayout(
    industryId: string,
    table: Omit<TableLayout, 'id' | 'status'>
  ): TableLayout | null {
    const config = this.industryConfigs().find(c => c.id === industryId && c.type === 'restaurant');
    if (!config || !config.settings.restaurant) return null;

    const newTable: TableLayout = {
      id: uuid(),
      ...table,
      status: 'available'
    };

    config.settings.restaurant.tableManagement.tableLayout.push(newTable);
    this.updateIndustryConfig(industryId, config);
    
    return newTable;
  }

  calculateEstimatedWaitTime(
    industryId: string,
    partySize: number,
    requestedTime?: Date
  ): number {
    const config = this.industryConfigs().find(c => c.id === industryId && c.type === 'restaurant');
    if (!config || !config.settings.restaurant) return 30;

    const tables = config.settings.restaurant.tableManagement.tableLayout;
    const availableTables = tables.filter(t => 
      t.capacity >= partySize && t.status === 'available'
    );

    if (availableTables.length > 0) return 0;

    // Calculate based on average table turn time
    const turnTime = config.settings.restaurant.tableManagement.tableTurnTime;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    
    return Math.ceil(occupiedTables / tables.length) * turnTime;
  }

  createMenuSpecial(
    industryId: string,
    special: Omit<MenuSpecial, 'id'>
  ): MenuSpecial | null {
    const config = this.industryConfigs().find(c => c.id === industryId && c.type === 'restaurant');
    if (!config || !config.settings.restaurant) return null;

    const newSpecial: MenuSpecial = {
      id: uuid(),
      ...special
    };

    config.settings.restaurant.menuManagement.specials.push(newSpecial);
    this.updateIndustryConfig(industryId, config);
    
    return newSpecial;
  }

  // Service-specific methods
  createAppointment(
    industryId: string,
    appointment: {
      customerId: string;
      serviceId: string;
      resourceId?: string;
      startTime: Date;
      duration?: number;
    }
  ): { success: boolean; appointmentId?: string; message?: string } {
    const config = this.industryConfigs().find(c => c.id === industryId && c.type === 'service');
    if (!config || !config.settings.service) {
      return { success: false, message: 'Invalid industry configuration' };
    }

    // Check availability
    const isAvailable = this.checkResourceAvailability(
      industryId,
      appointment.resourceId,
      appointment.startTime,
      appointment.duration || config.settings.service.appointments.duration
    );

    if (!isAvailable) {
      return { success: false, message: 'Resource not available at requested time' };
    }

    // Create appointment (would integrate with appointment service)
    const appointmentId = uuid();
    
    return { 
      success: true, 
      appointmentId,
      message: 'Appointment created successfully'
    };
  }

  private checkResourceAvailability(
    industryId: string,
    resourceId: string | undefined,
    startTime: Date,
    duration: number
  ): boolean {
    // This would check actual resource availability
    // For now, return true as placeholder
    return true;
  }

  calculateServicePrice(
    industryId: string,
    serviceId: string,
    strategyId: string,
    duration?: number,
    participants?: number
  ): number {
    const config = this.industryConfigs().find(c => c.id === industryId && c.type === 'service');
    if (!config || !config.settings.service) return 0;

    const strategy = config.settings.service.pricing.strategies.find(s => s.id === strategyId);
    if (!strategy) return 0;

    let price = strategy.baseRate;

    switch (strategy.type) {
      case 'fixed':
        return price;
      
      case 'hourly':
        return price * (duration || 1) / 60;
      
      case 'per_person':
        return price * (participants || 1);
      
      case 'tiered':
        const tiers = strategy.parameters['tiers'] || [];
        const applicableTier = tiers.find((tier: any) => 
          (participants || 1) >= tier.minParticipants && (participants || 1) <= tier.maxParticipants
        );
        return applicableTier ? applicableTier['price'] : price;
      
      case 'dynamic':
        return this.calculateDynamicServicePrice(price, strategy, duration, participants);
      
      default:
        return price;
    }
  }

  private calculateDynamicServicePrice(
    baseRate: number,
    strategy: ServicePricingStrategy,
    duration?: number,
    participants?: number
  ): number {
    let price = baseRate;
    
    // Time-based adjustment
    if (duration) {
      const hours = duration / 60;
      if (hours > 2) {
        price *= 0.9; // Discount for longer sessions
      }
    }
    
    // Participant-based adjustment
    if (participants && participants > 1) {
      price *= 1 + (participants - 1) * 0.1; // 10% per additional participant
    }
    
    // Peak time adjustment
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      price *= 1.1; // Peak hours premium
    }
    
    return Math.round(price * 100) / 100;
  }

  // Analytics
  getIndustryAnalytics(industryId: string, dateRange: { start: Date; end: Date }): any {
    const config = this.industryConfigs().find(c => c.id === industryId);
    if (!config) return null;

    switch (config.type) {
      case 'retail':
        return this.getRetailAnalytics(config, dateRange);
      case 'restaurant':
        return this.getRestaurantAnalytics(config, dateRange);
      case 'service':
        return this.getServiceAnalytics(config, dateRange);
      default:
        return null;
    }
  }

  private getRetailAnalytics(config: IndustryConfig, dateRange: { start: Date; end: Date }): any {
    return {
      totalSales: 125000,
      totalTransactions: 850,
      averageTransactionValue: 147.06,
      topProducts: [
        { name: 'Product A', sales: 15000, quantity: 120 },
        { name: 'Product B', sales: 12000, quantity: 95 }
      ],
      inventoryTurnover: 4.2,
      returnRate: 0.05,
      loyaltyProgramParticipation: 0.35,
      giftCardSales: 8500
    };
  }

  private getRestaurantAnalytics(config: IndustryConfig, dateRange: { start: Date; end: Date }): any {
    return {
      totalSales: 95000,
      totalCovers: 2100,
      averageCover: 45.24,
      tableTurnover: 2.8,
      peakHours: ['18:00-20:00', '12:00-13:00'],
      topMenuItems: [
        { name: 'Signature Dish', orders: 450, revenue: 13500 },
        { name: 'Popular Appetizer', orders: 380, revenue: 5700 }
      ],
      deliverySales: 22000,
      onlineOrders: 1800,
      reservationNoShowRate: 0.08
    };
  }

  private getServiceAnalytics(config: IndustryConfig, dateRange: { start: Date; end: Date }): any {
    return {
      totalRevenue: 78000,
      totalAppointments: 320,
      averageAppointmentValue: 243.75,
      resourceUtilization: 0.75,
      cancellationRate: 0.12,
      noShowRate: 0.05,
      popularServices: [
        { name: 'Premium Service', appointments: 120, revenue: 36000 },
        { name: 'Standard Service', appointments: 150, revenue: 30000 }
      ],
      repeatCustomerRate: 0.65,
      averageWaitTime: 15 // minutes
    };
  }

  // Private helper methods
  private initializeIndustryConfigs(): void {
    // Initialize retail config
    const retailConfig: IndustryConfig = {
      id: uuid(),
      name: 'Retail Store',
      type: 'retail',
      features: ['inventory', 'pos', 'customer_management', 'loyalty', 'gift_cards', 'returns'],
      settings: {
        taxRates: { sales: 0.08875, local: 0.045 },
        paymentMethods: ['cash', 'credit_card', 'debit_card', 'gift_card', 'mobile'],
        receiptOptions: {
          showLogo: true,
          showCustomerInfo: true,
          showTaxBreakdown: true,
          showDiscounts: true,
          showLoyaltyPoints: true,
          showBarcode: true
        },
        inventorySettings: {
          trackStock: true,
          lowStockAlerts: true,
          autoReorder: false,
          batchTracking: false,
          expiryTracking: true,
          categories: ['electronics', 'clothing', 'accessories', 'home']
        },
        customerSettings: {
          requireCustomerInfo: false,
          loyaltyProgram: true,
          customerAccounts: true,
          emailMarketing: true,
          smsMarketing: false
        },
        retail: {
          productTypes: ['physical', 'digital', 'service'],
          pricingStrategies: [],
          promotions: {
            enabled: true,
            types: ['percentage', 'fixed', 'bogo', 'bundle'],
            autoApply: true,
            stackable: false,
            maxDiscounts: 1,
            requireCoupon: false
          },
          returns: {
            enabled: true,
            timeLimit: 30,
            requireReceipt: true,
            restockFee: 0,
            exchangeOnly: false,
            storeCreditOnly: false
          },
          giftCards: {
            enabled: true,
            types: ['physical', 'digital'],
            expiryEnabled: false,
            expiryDays: 365,
            reloadable: true,
            minAmount: 10,
            maxAmount: 1000
          },
          loyalty: {
            enabled: true,
            pointsPerDollar: 1,
            redemptionRate: 100,
            tiers: [
              { id: 'bronze', name: 'Bronze', minPoints: 0, benefits: ['Basic rewards'], discountRate: 0, pointsMultiplier: 1 },
              { id: 'silver', name: 'Silver', minPoints: 500, benefits: ['5% discount', 'Bonus points'], discountRate: 5, pointsMultiplier: 1.2 },
              { id: 'gold', name: 'Gold', minPoints: 1500, benefits: ['10% discount', 'Free shipping', 'Exclusive offers'], discountRate: 10, pointsMultiplier: 1.5 }
            ],
            birthdayBonus: 50,
            referralBonus: 100
          }
        }
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Initialize restaurant config
    const restaurantConfig: IndustryConfig = {
      id: uuid(),
      name: 'Restaurant',
      type: 'restaurant',
      features: ['table_management', 'menu', 'kitchen_display', 'delivery', 'reservations', 'online_ordering'],
      settings: {
        taxRates: { sales: 0.08875, food: 0.085, alcohol: 0.10 },
        paymentMethods: ['cash', 'credit_card', 'mobile', 'split'],
        receiptOptions: {
          showLogo: true,
          showCustomerInfo: false,
          showTaxBreakdown: true,
          showDiscounts: true,
          showLoyaltyPoints: false,
          showBarcode: false
        },
        inventorySettings: {
          trackStock: true,
          lowStockAlerts: true,
          autoReorder: true,
          batchTracking: true,
          expiryTracking: true,
          categories: ['ingredients', 'beverages', 'supplies']
        },
        customerSettings: {
          requireCustomerInfo: false,
          loyaltyProgram: true,
          customerAccounts: false,
          emailMarketing: true,
          smsMarketing: true
        },
        restaurant: {
          tableManagement: {
            enabled: true,
            tableLayout: [],
            floorPlan: {
              id: uuid(),
              name: 'Main Floor',
              dimensions: { width: 800, height: 600 },
              tables: [],
              zones: []
            },
            autoAssign: false,
            tableTurnTime: 45,
            maxCapacity: 100
          },
          menuManagement: {
            categories: [],
            modifiers: [],
            combos: [],
            specials: [],
            pricing: {
              happyHour: {
                enabled: true,
                startTime: '15:00',
                endTime: '18:00',
                daysOfWeek: [1, 2, 3, 4, 5],
                discount: 20,
                applicableItems: []
              },
              timeBasedPricing: [],
              seasonalPricing: []
            }
          },
          kitchen: {
            displaySystem: 'kds',
            orderRouting: {
              rules: [],
              defaultStation: 'main',
              priorityRules: []
            },
            prepTime: {
              enabled: true,
              defaultTimes: { appetizer: 10, main: 20, dessert: 5 },
              rushMultiplier: 1.3,
              complexityFactors: []
            },
            inventory: {
              trackIngredients: true,
              autoDeduct: true,
              lowStockAlerts: true,
              recipeManagement: true
            }
          },
          service: {
            appointments: {
              duration: 120, // Restaurant reservations typically 2 hours
              bufferTime: 30,
              advanceBooking: 30,
              cancellationPolicy: {
                timeLimit: 2,
                fee: 25,
                feeType: 'fixed',
                noShowFee: 50
              },
              confirmationRequired: true,
              depositRequired: false,
              depositAmount: 0
            },
            scheduling: {
              businessHours: {
                monday: { open: '11:00', close: '22:00' },
                tuesday: { open: '11:00', close: '22:00' },
                wednesday: { open: '11:00', close: '22:00' },
                thursday: { open: '11:00', close: '22:00' },
                friday: { open: '11:00', close: '23:00' },
                saturday: { open: '10:00', close: '23:00' },
                sunday: { open: '10:00', close: '21:00' }
              },
              breaks: [],
              holidays: [],
              maxAppointments: 50, // Table reservations
              overlapAllowed: true
            },
            resources: {
              resources: [], // Tables, staff, equipment
              scheduling: {
                autoAssign: true,
                conflictDetection: true,
                optimizationEnabled: true,
                utilizationTarget: 85
              },
              utilization: {
                trackingEnabled: true,
                reportingFrequency: 'daily',
                alerts: [
                  { type: 'underutilized', threshold: 70, enabled: true },
                  { type: 'overutilized', threshold: 95, enabled: true }
                ]
              }
            },
            pricing: {
              strategies: [],
              packages: [], // Meal packages, group deals
              discounts: []
            },
            notifications: {
              reminders: {
                enabled: true,
                timing: [24, 2], // 24 hours and 2 hours before
                channels: ['email', 'sms'],
                template: 'Reminder: Your reservation is scheduled for {time}'
              },
              confirmations: {
                enabled: true,
                timing: 5, // 5 minutes after booking
                channels: ['email'],
                requireResponse: false
              },
              marketing: {
                enabled: true,
                promotions: true,
                newsletters: true,
                frequency: 'weekly',
                consentRequired: true
              }
            },
            tipOptions: [
              { percentage: 15, label: 'Good', isDefault: true },
              { percentage: 18, label: 'Great', isDefault: false },
              { percentage: 20, label: 'Excellent', isDefault: false },
              { percentage: 25, label: 'Outstanding', isDefault: false }
            ],
            serviceCharge: {
              enabled: false,
              percentage: 18,
              applicableParties: 6,
              autoApply: false
            },
            serverTracking: {
              trackSales: true,
              trackTips: true,
              trackTables: true,
              performanceMetrics: ['sales_per_hour', 'table_turns', 'customer_satisfaction']
            }
          },
          delivery: {
            enabled: true,
            zones: [],
            fees: {
              baseFee: 2.99,
              distanceFee: 0.50,
              timeFee: 0.10,
              weatherMultiplier: 1.2,
              rushHourMultiplier: 1.1
            },
            tracking: {
              enabled: true,
              customerNotifications: true,
              realTimeTracking: true,
              estimatedAccuracy: 5
            },
            drivers: {
              tracking: true,
              autoAssign: true,
              performanceMetrics: ['delivery_time', 'customer_rating', 'orders_per_hour'],
              paymentMethod: 'per_delivery'
            }
          },
          reservations: {
            enabled: true,
            maxPartySize: 12,
            advanceBooking: 30,
            confirmationRequired: true,
            depositRequired: false,
            depositAmount: 0,
            cancellationPolicy: {
              timeLimit: 2,
              fee: 25,
              feeType: 'fixed',
              noShowFee: 50
            }
          }
        }
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Initialize service config
    const serviceConfig: IndustryConfig = {
      id: uuid(),
      name: 'Service Business',
      type: 'service',
      features: ['appointments', 'scheduling', 'resource_management', 'client_management', 'billing'],
      settings: {
        taxRates: { sales: 0.08875, service: 0.08875 },
        paymentMethods: ['cash', 'credit_card', 'invoice', 'subscription'],
        receiptOptions: {
          showLogo: true,
          showCustomerInfo: true,
          showTaxBreakdown: true,
          showDiscounts: true,
          showLoyaltyPoints: false,
          showBarcode: false
        },
        inventorySettings: {
          trackStock: false,
          lowStockAlerts: false,
          autoReorder: false,
          batchTracking: false,
          expiryTracking: false,
          categories: []
        },
        customerSettings: {
          requireCustomerInfo: true,
          loyaltyProgram: false,
          customerAccounts: true,
          emailMarketing: true,
          smsMarketing: true
        },
        service: {
          appointments: {
            duration: 60,
            bufferTime: 15,
            advanceBooking: 90,
            cancellationPolicy: {
              timeLimit: 24,
              fee: 50,
              feeType: 'fixed',
              noShowFee: 100
            },
            confirmationRequired: true,
            depositRequired: false,
            depositAmount: 0
          },
          scheduling: {
            businessHours: {
              monday: { open: '09:00', close: '17:00' },
              tuesday: { open: '09:00', close: '17:00' },
              wednesday: { open: '09:00', close: '17:00' },
              thursday: { open: '09:00', close: '17:00' },
              friday: { open: '09:00', close: '17:00' },
              saturday: { open: '10:00', close: '14:00' },
              sunday: { open: '00:00', close: '00:00', closed: true }
            },
            breaks: [],
            holidays: [],
            maxAppointments: 8,
            overlapAllowed: false
          },
          resources: {
            resources: [],
            scheduling: {
              autoAssign: true,
              conflictDetection: true,
              optimizationEnabled: true,
              utilizationTarget: 80
            },
            utilization: {
              trackingEnabled: true,
              reportingFrequency: 'weekly',
              alerts: [
                { type: 'underutilized', threshold: 60, enabled: true },
                { type: 'overutilized', threshold: 95, enabled: true }
              ]
            }
          },
          pricing: {
            strategies: [],
            packages: [],
            discounts: []
          },
          notifications: {
            reminders: {
              enabled: true,
              timing: [24, 2], // 24 hours and 2 hours before
              channels: ['email', 'sms'],
              template: 'Reminder: Your appointment is scheduled for {time}'
            },
            confirmations: {
              enabled: true,
              timing: 5, // 5 minutes after booking
              channels: ['email'],
              requireResponse: false
            },
            marketing: {
              enabled: true,
              promotions: true,
              newsletters: true,
              frequency: 'monthly',
              consentRequired: true
            }
          },
          tipOptions: [
            { percentage: 15, label: 'Good', isDefault: true },
            { percentage: 18, label: 'Great', isDefault: false },
            { percentage: 20, label: 'Excellent', isDefault: false }
          ],
          serviceCharge: {
            enabled: false,
            percentage: 15,
            applicableParties: 6,
            autoApply: false
          },
          serverTracking: {
            trackSales: false,
            trackTips: false,
            trackTables: false,
            performanceMetrics: ['appointment_completion', 'customer_satisfaction']
          }
        }
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.industryConfigs.set([retailConfig, restaurantConfig, serviceConfig]);
    this.currentIndustry.set(retailConfig);
  }
}
