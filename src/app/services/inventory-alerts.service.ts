import { Injectable, signal, computed } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { v4 as uuid } from 'uuid';

export interface InventoryAlert {
  id: string;
  productId: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'expired';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  currentValue: number;
  thresholdValue: number;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  threshold: number;
  isActive: boolean;
  notifyEmail?: string;
  notifySms?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryAlertsService {
  private alerts = signal<InventoryAlert[]>([]);
  private alertRules = signal<AlertRule[]>([]);

  alerts$ = computed(() => this.alerts());
  alertRules$ = computed(() => this.alertRules());
  activeAlerts$ = computed(() => this.alerts().filter(alert => !alert.acknowledged));
  criticalAlerts$ = computed(() => this.alerts().filter(alert => 
    alert.severity === 'critical' && !alert.acknowledged
  ));

  constructor(private productService: ProductService) {
    this.initializeAlertRules();
    this.checkInventory();
  }

  private initializeAlertRules() {
    const defaultRules: AlertRule[] = [
      {
        id: 'low_stock_10',
        name: 'Low Stock Alert (10 units)',
        type: 'low_stock',
        threshold: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'out_of_stock_0',
        name: 'Out of Stock Alert',
        type: 'out_of_stock',
        threshold: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'overstock_100',
        name: 'Overstock Alert (100 units)',
        type: 'overstock',
        threshold: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.alertRules.set(defaultRules);
  }

  checkInventory(): void {
    const products = this.productService.getProducts();
    const newAlerts: InventoryAlert[] = [];

    products.forEach(product => {
      // Check each active alert rule
      this.alertRules().forEach(rule => {
        if (!rule.isActive) return;

        let alert: InventoryAlert | null = null;

        switch (rule.type) {
          case 'low_stock':
            if (product.quantity <= rule.threshold && product.quantity > 0) {
              alert = this.createLowStockAlert(product, rule.threshold);
            }
            break;
          
          case 'out_of_stock':
            if (product.quantity === 0) {
              alert = this.createOutOfStockAlert(product);
            }
            break;
          
          case 'overstock':
            if (product.quantity >= rule.threshold) {
              alert = this.createOverstockAlert(product, rule.threshold);
            }
            break;
        }

        if (alert) {
          // Check if similar alert already exists and is not acknowledged
          const existingAlert = this.alerts().find(a => 
            a.productId === product.id && 
            a.type === alert!.type && 
            !a.acknowledged
          );

          if (!existingAlert) {
            newAlerts.push(alert);
          }
        }
      });
    });

    if (newAlerts.length > 0) {
      this.alerts.update(alerts => [...alerts, ...newAlerts]);
    }
  }

  private createLowStockAlert(product: Product, threshold: number): InventoryAlert {
    const severity = this.calculateSeverity(product.quantity, threshold, 'low_stock');
    
    return {
      id: `alert_${product.id}_${Date.now()}`,
      productId: product.id,
      type: 'low_stock',
      severity,
      title: `Low Stock: ${product.name}`,
      message: `Product "${product.name}" has only ${product.quantity} units remaining. Threshold: ${threshold} units.`,
      currentValue: product.quantity,
      thresholdValue: threshold,
      createdAt: new Date(),
      acknowledged: false
    };
  }

  private createOutOfStockAlert(product: Product): InventoryAlert {
    return {
      id: `alert_${product.id}_${Date.now()}`,
      productId: product.id,
      type: 'out_of_stock',
      severity: 'critical',
      title: `Out of Stock: ${product.name}`,
      message: `Product "${product.name}" is completely out of stock. Immediate restocking required.`,
      currentValue: 0,
      thresholdValue: 0,
      createdAt: new Date(),
      acknowledged: false
    };
  }

  private createOverstockAlert(product: Product, threshold: number): InventoryAlert {
    return {
      id: `alert_${product.id}_${Date.now()}`,
      productId: product.id,
      type: 'overstock',
      severity: 'low',
      title: `Overstock: ${product.name}`,
      message: `Product "${product.name}" has ${product.quantity} units. Consider reducing inventory or running promotions.`,
      currentValue: product.quantity,
      thresholdValue: threshold,
      createdAt: new Date(),
      acknowledged: false
    };
  }

  private calculateSeverity(currentValue: number, threshold: number, type: string): 'low' | 'medium' | 'high' | 'critical' {
    if (type === 'low_stock') {
      const percentage = currentValue / threshold;
      if (percentage <= 0.2) return 'critical';
      if (percentage <= 0.5) return 'high';
      if (percentage <= 0.8) return 'medium';
      return 'low';
    }
    
    return 'medium';
  }

  // Alert management
  getAlerts(): InventoryAlert[] {
    return this.alerts();
  }

  getActiveAlerts(): InventoryAlert[] {
    return this.alerts().filter(alert => !alert.acknowledged);
  }

  getAlertsByType(type: string): InventoryAlert[] {
    return this.alerts().filter(alert => alert.type === type);
  }

  getAlertsBySeverity(severity: string): InventoryAlert[] {
    return this.alerts().filter(alert => alert.severity === severity);
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts().find(a => a.id === alertId);
    if (!alert) return false;

    const updatedAlert = {
      ...alert,
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date()
    };

    this.alerts.update(alerts => 
      alerts.map(a => a.id === alertId ? updatedAlert : a)
    );

    return true;
  }

  acknowledgeAllAlerts(acknowledgedBy: string): void {
    const unacknowledgedAlerts = this.alerts().filter(alert => !alert.acknowledged);
    
    const updatedAlerts = unacknowledgedAlerts.map(alert => ({
      ...alert,
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date()
    }));

    this.alerts.update(alerts => 
      alerts.map(alert => {
        const updated = updatedAlerts.find(a => a.id === alert.id);
        return updated || alert;
      })
    );
  }

  deleteAlert(alertId: string): boolean {
    const alert = this.alerts().find(a => a.id === alertId);
    if (!alert) return false;

    this.alerts.update(alerts => alerts.filter(a => a.id !== alertId));
    return true;
  }

  clearAcknowledgedAlerts(): void {
    this.alerts.update(alerts => alerts.filter(alert => !alert.acknowledged));
  }

  // Alert Rules management
  getAlertRules(): AlertRule[] {
    return this.alertRules();
  }

  addAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.alertRules.update(rules => [...rules, newRule]);
    return newRule;
  }

  updateAlertRule(id: string, updates: Partial<AlertRule>): AlertRule | undefined {
    const rule = this.alertRules().find(r => r.id === id);
    if (!rule) return undefined;

    const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
    this.alertRules.update(rules => 
      rules.map(r => r.id === id ? updatedRule : r)
    );

    return updatedRule;
  }

  deleteAlertRule(id: string): boolean {
    const rule = this.alertRules().find(r => r.id === id);
    if (!rule) return false;

    this.alertRules.update(rules => rules.filter(r => r.id !== id));
    return true;
  }

  toggleAlertRule(id: string): boolean {
    const rule = this.alertRules().find(r => r.id === id);
    if (!rule) return false;

    const updatedRule = { ...rule, isActive: !rule.isActive, updatedAt: new Date() };
    this.alertRules.update(rules => 
      rules.map(r => r.id === id ? updatedRule : r)
    );

    return updatedRule.isActive;
  }

  // Analytics
  getAlertAnalytics() {
    const alerts = this.alerts();
    const activeAlerts = this.getActiveAlerts();
    
    const alertsByType = {
      low_stock: alerts.filter(a => a.type === 'low_stock').length,
      out_of_stock: alerts.filter(a => a.type === 'out_of_stock').length,
      overstock: alerts.filter(a => a.type === 'overstock').length
    };

    const alertsBySeverity = {
      low: alerts.filter(a => a.severity === 'low').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      high: alerts.filter(a => a.severity === 'high').length,
      critical: alerts.filter(a => a.severity === 'critical').length
    };

    const recentAlerts = alerts.filter(alert => {
      const hoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return alert.createdAt >= hoursAgo;
    });

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
      alertsByType,
      alertsBySeverity,
      recentAlerts: recentAlerts.length,
      acknowledgedRate: alerts.length > 0 ? (alerts.filter(a => a.acknowledged).length / alerts.length) * 100 : 0
    };
  }

  // Utility methods
  getProductForAlert(alert: InventoryAlert): Product | undefined {
    return this.productService.getProductById(alert.productId);
  }

  getAlertColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  // Manual refresh
  refreshInventory(): void {
    this.checkInventory();
  }

  // Schedule periodic check (could be used with setInterval)
  startPeriodicCheck(intervalMs: number = 60000): void {
    setInterval(() => {
      this.checkInventory();
    }, intervalMs);
  }
}
