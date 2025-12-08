import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndustryConfig, RetailSettings, PricingStrategy, PromotionSettings, ReturnSettings, GiftCardSettings, RetailLoyaltySettings } from '../../../../services/industry.service';

@Component({
  selector: 'app-retail-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retail-settings.component.html',
  styleUrls: ['./retail-settings.component.scss']
})
export class RetailSettingsComponent {
  @Input() config: IndustryConfig | null = null;
  @Input() formData: Partial<RetailSettings> = {};
  @Output() save = new EventEmitter<void>();
  @Output() update = new EventEmitter<{ key: keyof RetailSettings; value: any }>();

  // Sample data for demonstration
  pricingStrategies: PricingStrategy[] = [
    { id: '1', name: 'Fixed Pricing', type: 'fixed', parameters: {}, isActive: true },
    { id: '2', name: 'Cost Plus', type: 'cost_plus', parameters: { margin: 30 }, isActive: true },
    { id: '3', name: 'Competitive', type: 'competitive', parameters: { competitors: [] }, isActive: false }
  ];

  productTypes = ['Physical', 'Digital', 'Service', 'Subscription', 'Rental'];

  updateField<K extends keyof RetailSettings>(key: K, value: RetailSettings[K]) {
    this.update.emit({ key, value });
  }

  // Helper methods for complex objects
  updatePromotionSettings(updates: Partial<PromotionSettings>) {
    const current = this.formData.promotions || {
      enabled: false,
      types: [],
      autoApply: false,
      stackable: false,
      maxDiscounts: 0,
      requireCoupon: false
    };
    this.updateField('promotions', { ...current, ...updates });
  }

  updateReturnSettings(updates: Partial<ReturnSettings>) {
    const current = this.formData.returns || {
      enabled: false,
      timeLimit: 30,
      requireReceipt: false,
      restockFee: 0,
      exchangeOnly: false,
      storeCreditOnly: false
    };
    this.updateField('returns', { ...current, ...updates });
  }

  updateGiftCardSettings(updates: Partial<GiftCardSettings>) {
    const current = this.formData.giftCards || {
      enabled: false,
      types: [],
      expiryEnabled: false,
      expiryDays: 365,
      reloadable: false,
      minAmount: 5,
      maxAmount: 1000
    };
    this.updateField('giftCards', { ...current, ...updates });
  }

  updateLoyaltySettings(updates: Partial<RetailLoyaltySettings>) {
    const current = this.formData.loyalty || {
      enabled: false,
      pointsPerDollar: 1,
      redemptionRate: 100,
      tiers: [],
      birthdayBonus: 0,
      referralBonus: 0
    };
    this.updateField('loyalty', { ...current, ...updates });
  }

  // Toggle methods
  togglePromotions(enabled: boolean) {
    this.updatePromotionSettings({ enabled });
  }

  toggleReturns(enabled: boolean) {
    this.updateReturnSettings({ enabled });
  }

  toggleGiftCards(enabled: boolean) {
    this.updateGiftCardSettings({ enabled });
  }

  toggleLoyalty(enabled: boolean) {
    this.updateLoyaltySettings({ enabled });
  }
}