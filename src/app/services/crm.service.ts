import { Injectable, signal, computed } from '@angular/core';
import { Customer } from '../models/customer.model';
import { v4 as uuid } from 'uuid';

export interface CustomerProfile extends Customer {
  // Extended CRM fields
  customerSince: Date;
  lastVisitDate: Date;
  visitCount: number;
  totalSpent: number;
  averageTransactionValue: number;
  favoriteProducts: string[];
  preferredCommunication: 'email' | 'phone' | 'sms' | 'mail';
  tags: string[];
  notes: CustomerNote[];
  membershipTier: MembershipTier;
  customFields: Record<string, any>;
  preferences: CustomerPreferences;
  addresses: CustomerAddress[];
  paymentMethods: CustomerPaymentMethod[];
  appointments: CustomerAppointment[];
  subscriptions: CustomerSubscription[];
}

export interface MembershipTier {
  id: string;
  name: string;
  level: number;
  benefits: string[];
  requirements: {
    minSpent?: number;
    minVisits?: number;
    minMonths?: number;
  };
  pointsMultiplier: number;
  discountPercentage: number;
  exclusiveOffers: boolean;
  prioritySupport: boolean;
}

export interface CustomerNote {
  id: string;
  content: string;
  type: 'general' | 'complaint' | 'compliment' | 'preference' | 'warning';
  createdBy: string;
  createdAt: Date;
  isPrivate: boolean;
  tags: string[];
}

export interface CustomerPreferences {
  preferredStore?: string;
  preferredStaff?: string;
  notificationPreferences: {
    promotions: boolean;
    newProducts: boolean;
    appointments: boolean;
    newsletters: boolean;
    orderUpdates: boolean;
  };
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  language: string;
  currency: string;
}

export interface CustomerAddress {
  id: string;
  type: 'billing' | 'shipping' | 'both';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerPaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'digital_wallet';
  token: string; // Secure token from payment processor
  lastFour: string;
  expiryDate?: string;
  cardType?: string;
  isDefault: boolean;
  isExpired: boolean;
}

export interface CustomerAppointment {
  id: string;
  serviceType: string;
  scheduledDate: Date;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  staffId?: string;
  staffName?: string;
  notes?: string;
  reminderSent: boolean;
}

export interface CustomerSubscription {
  id: string;
  type: string;
  name: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  price: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  autoRenew: boolean;
  benefits: string[];
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  pointsPerDollar: number;
  redemptionRate: number; // Points to dollar conversion
  tiers: MembershipTier[];
  rewards: LoyaltyReward[];
  expirationPolicy: {
    pointsExpireAfterDays: number;
    expireOnInactive: boolean;
    inactiveDaysThreshold: number;
  };
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_product' | 'service' | 'experience';
  pointsCost: number;
  value: number;
  restrictions?: string[];
  isActive: boolean;
  category?: string;
}

export interface CustomerLoyalty {
  customerId: string;
  programId: string;
  currentPoints: number;
  lifetimePoints: number;
  pointsEarned: number;
  pointsRedeemed: number;
  tierId: string;
  tierProgress: {
    currentTierPoints: number;
    nextTierPoints: number;
    progressPercentage: number;
  };
  lastActivityDate: Date;
  expirationDate?: Date;
  rewards: CustomerReward[];
}

export interface CustomerReward {
  id: string;
  rewardId: string;
  redeemedAt: Date;
  usedAt?: Date;
  status: 'available' | 'used' | 'expired';
  redemptionCode?: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customerCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  spentRange?: { min?: number; max?: number };
  visitRange?: { min?: number; max?: number };
  dateRange?: { start?: Date; end?: Date };
  categories?: string[];
  tags?: string[];
  tierIds?: string[];
  customRules?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }>;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'direct_mail' | 'in_store';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  targetSegments: string[];
  content: {
    subject?: string;
    body: string;
    imageUrl?: string;
    callToAction?: string;
  };
  schedule: {
    startDate?: Date;
    endDate?: Date;
    sendTime?: string;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  metrics: {
    sentCount: number;
    openedCount: number;
    clickedCount: number;
    convertedCount: number;
    unsubscribedCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CRMService {
  private customers = signal<CustomerProfile[]>([]);
  private loyaltyPrograms = signal<LoyaltyProgram[]>([]);
  private customerLoyalty = signal<CustomerLoyalty[]>([]);
  private segments = signal<CustomerSegment[]>([]);
  private campaigns = signal<MarketingCampaign[]>([]);

  customers$ = computed(() => this.customers());
  loyaltyPrograms$ = computed(() => this.loyaltyPrograms());
  customerLoyalty$ = computed(() => this.customerLoyalty());
  segments$ = computed(() => this.segments());
  campaigns$ = computed(() => this.campaigns());

  constructor() {
    this.initializeLoyaltyPrograms();
    this.initializeSegments();
    this.loadMockData();
  }

  // Customer Management
  createCustomer(customerData: Partial<CustomerProfile>, userId: string): CustomerProfile {
    const customer: CustomerProfile = {
      id: uuid(),
      name: customerData.name || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      loyaltyPoints: 0,
      totalSpent: 0,
      totalTransactions: 0,
      customerSince: new Date(),
      lastVisitDate: new Date(),
      visitCount: 0,
      averageTransactionValue: 0,
      favoriteProducts: [],
      preferredCommunication: 'email',
      tags: [],
      notes: [],
      membershipTier: this.getDefaultTier(),
      customFields: {},
      preferences: this.getDefaultPreferences(),
      addresses: [],
      paymentMethods: [],
      appointments: [],
      subscriptions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.customers.update(customers => [...customers, customer]);
    
    // Initialize loyalty
    this.initializeCustomerLoyalty(customer.id);
    
    return customer;
  }

  updateCustomer(customerId: string, updates: Partial<CustomerProfile>): CustomerProfile | null {
    const customers = this.customers();
    const index = customers.findIndex(c => c.id === customerId);
    
    if (index === -1) return null;

    const updatedCustomer = {
      ...customers[index],
      ...updates,
      updatedAt: new Date()
    };

    this.customers.update(c => [...c.slice(0, index), updatedCustomer, ...c.slice(index + 1)]);
    return updatedCustomer;
  }

  // Customer Activity Tracking
  recordCustomerActivity(
    customerId: string,
    transactionAmount: number,
    products: string[],
    storeId?: string
  ): void {
    const customer = this.customers().find(c => c.id === customerId);
    if (!customer) return;

    const updates: Partial<CustomerProfile> = {
      lastVisitDate: new Date(),
      visitCount: customer.visitCount + 1,
      totalSpent: customer.totalSpent + transactionAmount,
      averageTransactionValue: (customer.totalSpent + transactionAmount) / (customer.visitCount + 1)
    };

    // Update favorite products
    const updatedFavorites = [...customer.favoriteProducts];
    products.forEach(productId => {
      if (!updatedFavorites.includes(productId)) {
        updatedFavorites.push(productId);
      }
    });
    updates.favoriteProducts = updatedFavorites.slice(0, 10); // Keep top 10

    this.updateCustomer(customerId, updates);
    
    // Award loyalty points
    this.awardLoyaltyPoints(customerId, transactionAmount, 'purchase');
    
    // Update customer segment
    this.updateCustomerSegment(customerId);
  }

  addCustomerNote(
    customerId: string,
    content: string,
    type: CustomerNote['type'],
    createdBy: string,
    isPrivate: boolean = false,
    tags: string[] = []
  ): CustomerNote | null {
    const customer = this.customers().find(c => c.id === customerId);
    if (!customer) return null;

    const note: CustomerNote = {
      id: uuid(),
      content,
      type,
      createdBy,
      createdAt: new Date(),
      isPrivate,
      tags
    };

    this.updateCustomer(customerId, {
      notes: [...customer.notes, note]
    });

    return note;
  }

  // Loyalty Program Management
  awardLoyaltyPoints(
    customerId: string,
    transactionAmount: number,
    reason: 'purchase' | 'referral' | 'bonus' | 'correction',
    multiplier: number = 1
  ): void {
    const customerLoyalty = this.customerLoyalty().find(cl => cl.customerId === customerId);
    if (!customerLoyalty) return;

    const loyaltyProgram = this.loyaltyPrograms().find(lp => lp.id === customerLoyalty.programId);
    if (!loyaltyProgram) return;

    const pointsEarned = Math.floor(transactionAmount * loyaltyProgram.pointsPerDollar * multiplier);
    
    const updatedLoyalty = {
      ...customerLoyalty,
      currentPoints: customerLoyalty.currentPoints + pointsEarned,
      lifetimePoints: customerLoyalty.lifetimePoints + pointsEarned,
      pointsEarned: customerLoyalty.pointsEarned + pointsEarned,
      lastActivityDate: new Date()
    };

    // Check for tier upgrade
    const newTier = this.checkTierUpgrade(updatedLoyalty, loyaltyProgram);
    if (newTier) {
      updatedLoyalty.tierId = newTier.id;
      updatedLoyalty.tierProgress = this.calculateTierProgress(updatedLoyalty, loyaltyProgram);
    }

    this.customerLoyalty.update(cl => 
      cl.map(l => l.customerId === customerId ? updatedLoyalty : l)
    );
  }

  redeemLoyaltyPoints(
    customerId: string,
    rewardId: string,
    pointsCost: number
  ): { success: boolean; message: string; redemptionCode?: string } {
    const customerLoyalty = this.customerLoyalty().find(cl => cl.customerId === customerId);
    if (!customerLoyalty) {
      return { success: false, message: 'Customer loyalty account not found' };
    }

    if (customerLoyalty.currentPoints < pointsCost) {
      return { success: false, message: 'Insufficient points' };
    }

    const loyaltyProgram = this.loyaltyPrograms().find(lp => lp.id === customerLoyalty.programId);
    const reward = loyaltyProgram?.rewards.find(r => r.id === rewardId);
    
    if (!reward || reward.pointsCost !== pointsCost) {
      return { success: false, message: 'Invalid reward' };
    }

    // Process redemption
    const redemptionCode = `REDEEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const customerReward: CustomerReward = {
      id: uuid(),
      rewardId,
      redeemedAt: new Date(),
      status: 'available',
      redemptionCode
    };

    const updatedLoyalty = {
      ...customerLoyalty,
      currentPoints: customerLoyalty.currentPoints - pointsCost,
      pointsRedeemed: customerLoyalty.pointsRedeemed + pointsCost,
      rewards: [...customerLoyalty.rewards, customerReward],
      lastActivityDate: new Date()
    };

    this.customerLoyalty.update(cl => 
      cl.map(l => l.customerId === customerId ? updatedLoyalty : l)
    );

    return {
      success: true,
      message: `Successfully redeemed ${reward.name}`,
      redemptionCode
    };
  }

  // Customer Segmentation
  createSegment(segmentData: Omit<CustomerSegment, 'id' | 'customerCount' | 'createdAt' | 'updatedAt'>): CustomerSegment {
    const segment: CustomerSegment = {
      id: uuid(),
      customerCount: this.calculateSegmentSize(segmentData.criteria),
      ...segmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.segments.update(segments => [...segments, segment]);
    return segment;
  }

  getCustomersInSegment(segmentId: string): CustomerProfile[] {
    const segment = this.segments().find(s => s.id === segmentId);
    if (!segment) return [];

    return this.customers().filter(customer => 
      this.matchesSegmentCriteria(customer, segment.criteria)
    );
  }

  // Marketing Campaigns
  createCampaign(campaignData: Omit<MarketingCampaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): MarketingCampaign {
    const campaign: MarketingCampaign = {
      id: uuid(),
      metrics: {
        sentCount: 0,
        openedCount: 0,
        clickedCount: 0,
        convertedCount: 0,
        unsubscribedCount: 0
      },
      ...campaignData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.campaigns.update(campaigns => [...campaigns, campaign]);
    return campaign;
  }

  // Analytics and Reporting
  getCustomerAnalytics(dateRange: { start: Date; end: Date }): {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    totalRevenue: number;
    averageOrderValue: number;
    retentionRate: number;
    topCustomers: CustomerProfile[];
    segmentDistribution: Record<string, number>;
  } {
    const customers = this.customers();
    const newCustomers = customers.filter(c => c.customerSince >= dateRange.start && c.customerSince <= dateRange.end);
    const activeCustomers = customers.filter(c => c.lastVisitDate >= dateRange.start && c.lastVisitDate <= dateRange.end);
    
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageOrderValue = customers.length > 0 ? totalRevenue / customers.reduce((sum, c) => sum + c.visitCount, 0) : 0;
    
    const retentionRate = customers.length > 0 ? (activeCustomers.length / customers.length) * 100 : 0;

    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const segmentDistribution = this.segments().reduce((dist, segment) => {
      dist[segment.name] = this.getCustomersInSegment(segment.id).length;
      return dist;
    }, {} as Record<string, number>);

    return {
      totalCustomers: customers.length,
      newCustomers: newCustomers.length,
      activeCustomers: activeCustomers.length,
      totalRevenue,
      averageOrderValue,
      retentionRate,
      topCustomers,
      segmentDistribution
    };
  }

  getLoyaltyAnalytics(): {
    totalMembers: number;
    activeMembers: number;
    pointsIssued: number;
    pointsRedeemed: number;
    redemptionRate: number;
    tierDistribution: Record<string, number>;
    topRewards: Array<{ reward: LoyaltyReward; redemptionCount: number }>;
  } {
    const loyaltyData = this.customerLoyalty();
    const activeMembers = loyaltyData.filter(cl => 
      cl.lastActivityDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const totalPointsIssued = loyaltyData.reduce((sum, cl) => sum + cl.pointsEarned, 0);
    const totalPointsRedeemed = loyaltyData.reduce((sum, cl) => sum + cl.pointsRedeemed, 0);
    const redemptionRate = totalPointsIssued > 0 ? (totalPointsRedeemed / totalPointsIssued) * 100 : 0;

    const tierDistribution = loyaltyData.reduce((dist, cl) => {
      const tier = this.getTierById(cl.tierId);
      if (tier) {
        dist[tier.name] = (dist[tier.name] || 0) + 1;
      }
      return dist;
    }, {} as Record<string, number>);

    // Calculate top redeemed rewards
    const rewardRedemptions = loyaltyData.flatMap(cl => cl.rewards);
    const rewardCounts = rewardRedemptions.reduce((counts, reward) => {
      const key = reward.rewardId;
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const loyaltyProgram = this.loyaltyPrograms()[0];
    const topRewards = Object.entries(rewardCounts)
      .map(([rewardId, count]) => ({
        reward: loyaltyProgram.rewards.find(r => r.id === rewardId)!,
        redemptionCount: count
      }))
      .sort((a, b) => b.redemptionCount - a.redemptionCount)
      .slice(0, 5);

    return {
      totalMembers: loyaltyData.length,
      activeMembers: activeMembers.length,
      pointsIssued: totalPointsIssued,
      pointsRedeemed: totalPointsRedeemed,
      redemptionRate,
      tierDistribution,
      topRewards
    };
  }

  // Private helper methods
  private initializeCustomerLoyalty(customerId: string): void {
    const loyaltyProgram = this.loyaltyPrograms()[0];
    if (!loyaltyProgram) return;

    const customerLoyalty: CustomerLoyalty = {
      customerId,
      programId: loyaltyProgram.id,
      currentPoints: 0,
      lifetimePoints: 0,
      pointsEarned: 0,
      pointsRedeemed: 0,
      tierId: loyaltyProgram.tiers[0].id,
      tierProgress: {
        currentTierPoints: 0,
        nextTierPoints: loyaltyProgram.tiers[1]?.requirements.minSpent || 0,
        progressPercentage: 0
      },
      lastActivityDate: new Date(),
      rewards: []
    };

    this.customerLoyalty.update(cl => [...cl, customerLoyalty]);
  }

  private checkTierUpgrade(customerLoyalty: CustomerLoyalty, program: LoyaltyProgram): MembershipTier | null {
    const currentTierIndex = program.tiers.findIndex(t => t.id === customerLoyalty.tierId);
    if (currentTierIndex === -1 || currentTierIndex === program.tiers.length - 1) return null;

    const nextTier = program.tiers[currentTierIndex + 1];
    const requirements = nextTier.requirements;

    let qualifies = false;
    if (requirements.minSpent && customerLoyalty.lifetimePoints >= requirements.minSpent) qualifies = true;
    if (requirements.minVisits) {
      const customer = this.customers().find(c => c.id === customerLoyalty.customerId);
      if (customer && customer.visitCount >= requirements.minVisits) qualifies = true;
    }
    if (requirements.minMonths) {
      const monthsSinceJoin = Math.floor(
        (Date.now() - customerLoyalty.lastActivityDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      if (monthsSinceJoin >= requirements.minMonths) qualifies = true;
    }

    return qualifies ? nextTier : null;
  }

  private calculateTierProgress(customerLoyalty: CustomerLoyalty, program: LoyaltyProgram): CustomerLoyalty['tierProgress'] {
    const currentTier = program.tiers.find(t => t.id === customerLoyalty.tierId);
    const nextTierIndex = program.tiers.findIndex(t => t.id === customerLoyalty.tierId) + 1;
    const nextTier = nextTierIndex < program.tiers.length ? program.tiers[nextTierIndex] : null;

    if (!nextTier) {
      return {
        currentTierPoints: customerLoyalty.lifetimePoints,
        nextTierPoints: customerLoyalty.lifetimePoints,
        progressPercentage: 100
      };
    }

    const currentTierPoints = currentTier?.requirements.minSpent || 0;
    const nextTierPoints = nextTier.requirements.minSpent || 0;
    const progressPercentage = ((customerLoyalty.lifetimePoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;

    return {
      currentTierPoints: customerLoyalty.lifetimePoints,
      nextTierPoints,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage))
    };
  }

  private matchesSegmentCriteria(customer: CustomerProfile, criteria: SegmentCriteria): boolean {
    if (criteria.spentRange) {
      if (criteria.spentRange.min && customer.totalSpent < criteria.spentRange.min) return false;
      if (criteria.spentRange.max && customer.totalSpent > criteria.spentRange.max) return false;
    }

    if (criteria.visitRange) {
      if (criteria.visitRange.min && customer.visitCount < criteria.visitRange.min) return false;
      if (criteria.visitRange.max && customer.visitCount > criteria.visitRange.max) return false;
    }

    if (criteria.dateRange) {
      if (criteria.dateRange.start && customer.customerSince < criteria.dateRange.start) return false;
      if (criteria.dateRange.end && customer.customerSince > criteria.dateRange.end) return false;
    }

    if (criteria.tags && criteria.tags.length > 0) {
      const hasAllTags = criteria.tags.every(tag => customer.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    if (criteria.tierIds && criteria.tierIds.length > 0) {
      if (!criteria.tierIds.includes(customer.membershipTier.id)) return false;
    }

    return true;
  }

  private calculateSegmentSize(criteria: SegmentCriteria): number {
    return this.customers().filter(customer => this.matchesSegmentCriteria(customer, criteria)).length;
  }

  private updateCustomerSegment(customerId: string): void {
    // This would update customer segments based on new activity
    // Implementation would depend on specific business rules
  }

  private getDefaultTier(): MembershipTier {
    return {
      id: 'bronze',
      name: 'Bronze',
      level: 1,
      benefits: ['Basic member benefits'],
      requirements: { minSpent: 0 },
      pointsMultiplier: 1,
      discountPercentage: 0,
      exclusiveOffers: false,
      prioritySupport: false
    };
  }

  private getDefaultPreferences(): CustomerPreferences {
    return {
      notificationPreferences: {
        promotions: true,
        newProducts: false,
        appointments: true,
        newsletters: false,
        orderUpdates: true
      },
      marketingConsent: true,
      dataProcessingConsent: true,
      language: 'en',
      currency: 'USD'
    };
  }

  private getTierById(tierId: string): MembershipTier | null {
    const program = this.loyaltyPrograms()[0];
    return program?.tiers.find(t => t.id === tierId) || null;
  }

  private initializeLoyaltyPrograms(): void {
    const loyaltyProgram: LoyaltyProgram = {
      id: uuid(),
      name: 'Rewards Plus',
      description: 'Earn points with every purchase and unlock exclusive benefits',
      isActive: true,
      pointsPerDollar: 1,
      redemptionRate: 100, // 100 points = $1
      tiers: [
        {
          id: 'bronze',
          name: 'Bronze',
          level: 1,
          benefits: ['Earn 1 point per dollar', 'Birthday bonus'],
          requirements: { minSpent: 0 },
          pointsMultiplier: 1,
          discountPercentage: 0,
          exclusiveOffers: false,
          prioritySupport: false
        },
        {
          id: 'silver',
          name: 'Silver',
          level: 2,
          benefits: ['Earn 1.2 points per dollar', '5% off purchases', 'Early access to sales'],
          requirements: { minSpent: 500 },
          pointsMultiplier: 1.2,
          discountPercentage: 5,
          exclusiveOffers: true,
          prioritySupport: false
        },
        {
          id: 'gold',
          name: 'Gold',
          level: 3,
          benefits: ['Earn 1.5 points per dollar', '10% off purchases', 'Free shipping', 'Exclusive events'],
          requirements: { minSpent: 1500 },
          pointsMultiplier: 1.5,
          discountPercentage: 10,
          exclusiveOffers: true,
          prioritySupport: true
        },
        {
          id: 'platinum',
          name: 'Platinum',
          level: 4,
          benefits: ['Earn 2 points per dollar', '15% off purchases', 'Free shipping', 'Personal shopper', 'VIP events'],
          requirements: { minSpent: 5000 },
          pointsMultiplier: 2,
          discountPercentage: 15,
          exclusiveOffers: true,
          prioritySupport: true
        }
      ],
      rewards: [
        {
          id: 'discount5',
          name: '$5 Off',
          description: 'Get $5 off your next purchase',
          type: 'discount',
          pointsCost: 500,
          value: 5,
          isActive: true
        },
        {
          id: 'discount10',
          name: '$10 Off',
          description: 'Get $10 off your next purchase',
          type: 'discount',
          pointsCost: 1000,
          value: 10,
          isActive: true
        },
        {
          id: 'freeship',
          name: 'Free Shipping',
          description: 'Free shipping on your next order',
          type: 'service',
          pointsCost: 300,
          value: 10,
          isActive: true
        }
      ],
      expirationPolicy: {
        pointsExpireAfterDays: 365,
        expireOnInactive: true,
        inactiveDaysThreshold: 180
      }
    };

    this.loyaltyPrograms.set([loyaltyProgram]);
  }

  private initializeSegments(): void {
    const segments: CustomerSegment[] = [
      {
        id: uuid(),
        name: 'VIP Customers',
        description: 'High-value customers with frequent purchases',
        criteria: {
          spentRange: { min: 1000 },
          visitRange: { min: 10 }
        },
        customerCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'New Customers',
        description: 'Customers who joined in the last 30 days',
        criteria: {
          dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        customerCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        name: 'At Risk',
        description: 'Customers who haven\'t purchased in 90 days',
        criteria: {
          spentRange: { min: 100 },
          customRules: [{
            field: 'lastVisitDate',
            operator: 'less_than',
            value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }]
        },
        customerCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.segments.set(segments);
  }

  private loadMockData(): void {
    // Mock data would be loaded here
  }
}
