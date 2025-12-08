import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndustryService } from '../../services/industry.service';
import { IndustryConfig } from '../../services/industry.service';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business.component.html',
  styleUrl: './business.component.scss'
})
export class BusinessComponent {
  Object = Object; // Add Object reference for template use
  private industryService = inject(IndustryService);
  
  industryConfigs = signal<IndustryConfig[]>([]);
  currentIndustry = signal<IndustryConfig | null>(null);
  selectedTab = signal<'settings' | 'tax' | 'payment' | 'inventory' | 'customers' | 'receipts'>('settings');
  
  // Form models
  businessName = signal('');
  businessAddress = signal('');
  businessPhone = signal('');
  businessEmail = signal('');
  
  constructor() {
    this.loadIndustryConfigs();
  }
  
  loadIndustryConfigs() {
    effect(() => {
      const configs = this.industryService.industryConfigs$();
      this.industryConfigs.set(configs);
    });
    
    effect(() => {
      const industry = this.industryService.currentIndustry$();
      this.currentIndustry.set(industry);
      if (industry) {
        this.businessName.set(industry.name);
      }
    });
  }
  
  selectIndustry(industry: IndustryConfig) {
    this.industryService.setCurrentIndustry(industry);
  }
  
  updateBusinessSettings() {
    const current = this.currentIndustry();
    if (current) {
      const updatedConfig = {
        ...current,
        name: this.businessName(),
        updatedAt: new Date()
      };
      this.industryService.updateIndustryConfig(current.id, updatedConfig);
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}