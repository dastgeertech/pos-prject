import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { v4 as uuid } from 'uuid';

export interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  averageCost: number;
  lastUpdated: Date;
  location: string;
  batchNumber?: string;
  expiryDate?: Date;
  supplierId?: string;
  status: 'active' | 'discontinued' | 'on_order' | 'backordered';
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'return' | 'damage' | 'theft';
  quantity: number;
  referenceId?: string; // Sale ID, Purchase Order ID, etc.
  reason?: string;
  userId?: string;
  location?: string;
  timestamp: Date;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
}

export interface InventoryAlert {
  id: string;
  inventoryItemId: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'expired' | 'reorder_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  currentValue: number;
  thresholdValue: number;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  receivedQuantity: number;
  remainingQuantity: number;
}

export interface StockCount {
  id: string;
  countNumber: string;
  location?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'discrepancy_found';
  items: StockCountItem[];
  totalValue: number;
  countedBy?: string;
  countedAt?: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockCountItem {
  inventoryItemId: string;
  productId: string;
  productName: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  unitCost: number;
  varianceValue: number;
  reason?: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  type: 'warehouse' | 'store' | 'storage' | 'display';
  address?: string;
  isActive: boolean;
  manager?: string;
  capacity?: number;
  currentUtilization: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventoryItems = signal<InventoryItem[]>([]);
  private stockMovements = signal<StockMovement[]>([]);
  private alerts = signal<InventoryAlert[]>([]);
  private purchaseOrders = signal<PurchaseOrder[]>([]);
  private stockCounts = signal<StockCount[]>([]);
  private locations = signal<InventoryLocation[]>([]);

  inventoryItems$ = computed(() => this.inventoryItems());
  stockMovements$ = computed(() => this.stockMovements());
  alerts$ = computed(() => this.alerts());
  purchaseOrders$ = computed(() => this.purchaseOrders());
  stockCounts$ = computed(() => this.stockCounts());
  locations$ = computed(() => this.locations());

  constructor() {
    this.initializeLocations();
    this.loadMockData();
  }

  // Get inventory item by product ID
  getInventoryItem(productId: string): InventoryItem | null {
    return this.inventoryItems().find(item => item.productId === productId) || null;
  }

  // Update stock quantity
  updateStock(
    productId: string,
    quantity: number,
    type: StockMovement['type'],
    referenceId?: string,
    reason?: string,
    userId?: string
  ): InventoryItem | null {
    const inventoryItem = this.getInventoryItem(productId);
    if (!inventoryItem) return null;

    const previousStock = inventoryItem.currentStock;
    const newStock = Math.max(0, previousStock + quantity);

    const movement: StockMovement = {
      id: uuid(),
      inventoryItemId: inventoryItem.id,
      type,
      quantity,
      referenceId,
      reason,
      userId,
      timestamp: new Date(),
      previousStock,
      newStock,
      unitCost: inventoryItem.averageCost,
      totalCost: Math.abs(quantity) * inventoryItem.averageCost
    };

    this.stockMovements.update(movements => [...movements, movement]);

    const updatedItem = {
      ...inventoryItem,
      currentStock: newStock,
      lastUpdated: new Date()
    };

    this.inventoryItems.update(items => 
      items.map(item => item.id === inventoryItem.id ? updatedItem : item)
    );

    this.checkInventoryAlerts(updatedItem);
    return updatedItem;
  }

  // Process sale (reduce stock)
  processSale(items: Array<{ productId: string; quantity: number }>, saleId: string, userId?: string): boolean {
    let success = true;

    for (const item of items) {
      const inventoryItem = this.getInventoryItem(item.productId);
      if (!inventoryItem || inventoryItem.currentStock < item.quantity) {
        success = false;
        continue;
      }

      this.updateStock(
        item.productId,
        -item.quantity,
        'sale',
        saleId,
        'Sale transaction',
        userId
      );
    }

    return success;
  }

  // Process purchase order receipt
  receivePurchaseOrder(
    purchaseOrderId: string,
    receivedItems: Array<{ productId: string; quantity: number; unitCost: number }>,
    userId?: string
  ): boolean {
    const purchaseOrder = this.purchaseOrders().find(po => po.id === purchaseOrderId);
    if (!purchaseOrder) return false;

    let totalReceived = true;

    for (const receivedItem of receivedItems) {
      const inventoryItem = this.getInventoryItem(receivedItem.productId);
      if (!inventoryItem) continue;

      // Update stock with new items
      this.updateStock(
        receivedItem.productId,
        receivedItem.quantity,
        'purchase',
        purchaseOrderId,
        'Purchase order receipt',
        userId
      );

      // Update average cost
      const totalValue = inventoryItem.currentStock * inventoryItem.averageCost + 
                       receivedItem.quantity * receivedItem.unitCost;
      const totalQuantity = inventoryItem.currentStock + receivedItem.quantity;
      const newAverageCost = totalQuantity > 0 ? totalValue / totalQuantity : receivedItem.unitCost;

      this.inventoryItems.update(items => 
        items.map(item => 
          item.id === inventoryItem.id 
            ? { ...item, averageCost: newAverageCost, unitCost: receivedItem.unitCost }
            : item
        )
      );
    }

    // Update purchase order status
    this.updatePurchaseOrderStatus(purchaseOrderId, 'received');
    return true;
  }

  // Create purchase order
  createPurchaseOrder(
    supplierId: string,
    supplierName: string,
    items: Array<{ productId: string; quantity: number; unitPrice: number }>,
    expectedDeliveryDate?: Date
  ): PurchaseOrder {
    const orderNumber = this.generatePurchaseOrderNumber();
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = 25; // Fixed shipping
    const total = subtotal + tax + shipping;

    const purchaseOrder: PurchaseOrder = {
      id: uuid(),
      orderNumber,
      supplierId,
      supplierName,
      status: 'draft',
      items: items.map(item => ({
        id: uuid(),
        productId: item.productId,
        productName: '', // Would be populated from product service
        sku: '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        receivedQuantity: 0,
        remainingQuantity: item.quantity
      })),
      subtotal,
      tax,
      shipping,
      total,
      orderDate: new Date(),
      expectedDeliveryDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.purchaseOrders.update(orders => [...orders, purchaseOrder]);
    return purchaseOrder;
  }

  // Create stock count
  createStockCount(location?: string): StockCount {
    const countNumber = this.generateStockCountNumber();
    
    // Get all inventory items for the location (or all if no location specified)
    const itemsToCount = location 
      ? this.inventoryItems().filter(item => item.location === location)
      : this.inventoryItems();

    const stockCountItems: StockCountItem[] = itemsToCount.map(item => ({
      inventoryItemId: item.id,
      productId: item.productId,
      productName: item.product.name,
      systemQuantity: item.currentStock,
      countedQuantity: 0,
      variance: 0,
      unitCost: item.averageCost,
      varianceValue: 0
    }));

    const stockCount: StockCount = {
      id: uuid(),
      countNumber,
      location,
      status: 'planned',
      items: stockCountItems,
      totalValue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.stockCounts.update(counts => [...counts, stockCount]);
    return stockCount;
  }

  // Complete stock count
  completeStockCount(
    stockCountId: string,
    countedItems: Array<{ inventoryItemId: string; countedQuantity: number; reason?: string }>,
    userId: string
  ): StockCount | null {
    const stockCount = this.stockCounts().find(sc => sc.id === stockCountId);
    if (!stockCount) return null;

    const updatedItems = stockCount.items.map(item => {
      const countedItem = countedItems.find(ci => ci.inventoryItemId === item.inventoryItemId);
      const countedQuantity = countedItem?.countedQuantity || 0;
      const variance = countedQuantity - item.systemQuantity;
      const varianceValue = variance * item.unitCost;

      return {
        ...item,
        countedQuantity,
        variance,
        varianceValue,
        reason: countedItem?.reason
      };
    });

    const totalVarianceValue = updatedItems.reduce((sum, item) => sum + Math.abs(item.varianceValue), 0);
    const hasDiscrepancies = updatedItems.some(item => item.variance !== 0);

    const updatedStockCount: StockCount = {
      ...stockCount,
      items: updatedItems,
      totalValue: totalVarianceValue,
      status: hasDiscrepancies ? 'discrepancy_found' : 'completed',
      countedBy: userId,
      countedAt: new Date(),
      updatedAt: new Date()
    };

    this.stockCounts.update(counts => 
      counts.map(sc => sc.id === stockCountId ? updatedStockCount : sc)
    );

    // Process stock adjustments for discrepancies
    for (const item of updatedItems) {
      if (item.variance !== 0) {
        this.updateStock(
          item.productId,
          item.variance,
          'adjustment',
          stockCountId,
          `Stock count adjustment: ${item.reason || 'Count discrepancy'}`,
          userId
        );
      }
    }

    return updatedStockCount;
  }

  // Get low stock items
  getLowStockItems(): InventoryItem[] {
    return this.inventoryItems().filter(item => 
      item.currentStock <= item.reorderPoint && 
      item.status === 'active'
    );
  }

  // Get out of stock items
  getOutOfStockItems(): InventoryItem[] {
    return this.inventoryItems().filter(item => 
      item.currentStock === 0 && 
      item.status === 'active'
    );
  }

  // Get expiring items
  getExpiringItems(days: number = 30): InventoryItem[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return this.inventoryItems().filter(item => 
      item.expiryDate && 
      item.expiryDate <= cutoffDate && 
      item.currentStock > 0
    );
  }

  // Get inventory value
  getInventoryValue(location?: string): {
    totalValue: number;
    totalItems: number;
    lowStockValue: number;
    overstockValue: number;
  } {
    const items = location 
      ? this.inventoryItems().filter(item => item.location === location)
      : this.inventoryItems();

    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.averageCost), 0);
    const totalItems = items.reduce((sum, item) => sum + item.currentStock, 0);
    
    const lowStockValue = items
      .filter(item => item.currentStock <= item.reorderPoint)
      .reduce((sum, item) => sum + (item.currentStock * item.averageCost), 0);
    
    const overstockValue = items
      .filter(item => item.currentStock >= item.maximumStock)
      .reduce((sum, item) => sum + (item.currentStock * item.averageCost), 0);

    return {
      totalValue,
      totalItems,
      lowStockValue,
      overstockValue
    };
  }

  // Generate reorder suggestions
  generateReorderSuggestions(): Array<{
    inventoryItem: InventoryItem;
    suggestedQuantity: number;
    estimatedCost: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const lowStockItems = this.getLowStockItems();

    return lowStockItems.map(item => {
      const suggestedQuantity = item.reorderQuantity;
      const estimatedCost = suggestedQuantity * item.unitCost;
      
      let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (item.currentStock === 0) urgency = 'critical';
      else if (item.currentStock < item.reorderPoint * 0.5) urgency = 'high';
      else if (item.currentStock < item.reorderPoint * 0.75) urgency = 'medium';

      return {
        inventoryItem: item,
        suggestedQuantity,
        estimatedCost,
        urgency
      };
    });
  }

  // Private methods
  private checkInventoryAlerts(inventoryItem: InventoryItem): void {
    const alerts: InventoryAlert[] = [];

    // Low stock alert
    if (inventoryItem.currentStock <= inventoryItem.reorderPoint && inventoryItem.currentStock > 0) {
      alerts.push({
        id: uuid(),
        inventoryItemId: inventoryItem.id,
        type: 'low_stock',
        severity: inventoryItem.currentStock === 0 ? 'critical' : 'medium',
        title: 'Low Stock Alert',
        message: `${inventoryItem.product.name} is running low on stock (${inventoryItem.currentStock} units remaining)`,
        currentValue: inventoryItem.currentStock,
        thresholdValue: inventoryItem.reorderPoint,
        isResolved: false,
        createdAt: new Date()
      });
    }

    // Out of stock alert
    if (inventoryItem.currentStock === 0) {
      alerts.push({
        id: uuid(),
        inventoryItemId: inventoryItem.id,
        type: 'out_of_stock',
        severity: 'critical',
        title: 'Out of Stock',
        message: `${inventoryItem.product.name} is completely out of stock`,
        currentValue: 0,
        thresholdValue: 1,
        isResolved: false,
        createdAt: new Date()
      });
    }

    // Overstock alert
    if (inventoryItem.currentStock >= inventoryItem.maximumStock) {
      alerts.push({
        id: uuid(),
        inventoryItemId: inventoryItem.id,
        type: 'overstock',
        severity: 'low',
        title: 'Overstock Alert',
        message: `${inventoryItem.product.name} is overstocked (${inventoryItem.currentStock} units)`,
        currentValue: inventoryItem.currentStock,
        thresholdValue: inventoryItem.maximumStock,
        isResolved: false,
        createdAt: new Date()
      });
    }

    // Expiry alert
    if (inventoryItem.expiryDate) {
      const daysUntilExpiry = Math.ceil((inventoryItem.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 0 && inventoryItem.currentStock > 0) {
        alerts.push({
          id: uuid(),
          inventoryItemId: inventoryItem.id,
          type: 'expired',
          severity: 'critical',
          title: 'Product Expired',
          message: `${inventoryItem.product.name} has expired and should be removed`,
          currentValue: inventoryItem.currentStock,
          thresholdValue: 0,
          isResolved: false,
          createdAt: new Date()
        });
      } else if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        alerts.push({
          id: uuid(),
          inventoryItemId: inventoryItem.id,
          type: 'expiring',
          severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
          title: 'Product Expiring Soon',
          message: `${inventoryItem.product.name} expires in ${daysUntilExpiry} days`,
          currentValue: daysUntilExpiry,
          thresholdValue: 30,
          isResolved: false,
          createdAt: new Date()
        });
      }
    }

    // Add alerts to the signal
    if (alerts.length > 0) {
      this.alerts.update(currentAlerts => [...currentAlerts, ...alerts]);
    }
  }

  private updatePurchaseOrderStatus(purchaseOrderId: string, status: PurchaseOrder['status']): void {
    this.purchaseOrders.update(orders => 
      orders.map(po => 
        po.id === purchaseOrderId 
          ? { ...po, status, updatedAt: new Date() }
          : po
      )
    );
  }

  private generatePurchaseOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 9999) + 1;
    return `PO-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  private generateStockCountNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 999) + 1;
    return `SC-${year}${month}-${String(sequence).padStart(3, '0')}`;
  }

  private initializeLocations(): void {
    const locations: InventoryLocation[] = [
      {
        id: uuid(),
        name: 'Main Warehouse',
        type: 'warehouse',
        address: '123 Storage Lane, Industrial Park',
        isActive: true,
        manager: 'John Smith',
        capacity: 10000,
        currentUtilization: 6500
      },
      {
        id: uuid(),
        name: 'Downtown Store',
        type: 'store',
        address: '456 Main Street, Downtown',
        isActive: true,
        manager: 'Sarah Johnson',
        capacity: 1000,
        currentUtilization: 750
      }
    ];

    this.locations.set(locations);
  }

  private loadMockData(): void {
    // Mock inventory items
    const mockInventoryItems: InventoryItem[] = [
      {
        id: uuid(),
        productId: 'mock-laptop-id', // This would be replaced with actual product IDs
        product: {
          id: 'mock-laptop-id',
          name: 'Laptop',
          sku: 'LAPTOP-001',
          description: 'High-performance laptop',
          price: 999.99,
          cost: 600,
          quantity: 10,
          category: 'electronics',
          taxable: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        currentStock: 15,
        minimumStock: 5,
        maximumStock: 50,
        reorderPoint: 10,
        reorderQuantity: 25,
        unitCost: 600,
        averageCost: 600,
        lastUpdated: new Date(),
        location: 'Main Warehouse',
        status: 'active'
      },
      {
        id: uuid(),
        productId: 'mock-mouse-id',
        product: {
          id: 'mock-mouse-id',
          name: 'Wireless Mouse',
          sku: 'MOUSE-001',
          description: 'Ergonomic wireless mouse',
          price: 29.99,
          cost: 15,
          quantity: 50,
          category: 'electronics',
          taxable: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        currentStock: 8,
        minimumStock: 10,
        maximumStock: 100,
        reorderPoint: 15,
        reorderQuantity: 50,
        unitCost: 15,
        averageCost: 15,
        lastUpdated: new Date(),
        location: 'Downtown Store',
        status: 'active'
      },
      {
        id: uuid(),
        productId: 'mock-tshirt-id',
        product: {
          id: 'mock-tshirt-id',
          name: 'T-Shirt',
          sku: 'TSHIRT-001',
          description: 'Cotton t-shirt',
          price: 19.99,
          cost: 8,
          quantity: 100,
          category: 'clothing',
          taxable: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        currentStock: 0,
        minimumStock: 20,
        maximumStock: 200,
        reorderPoint: 25,
        reorderQuantity: 100,
        unitCost: 8,
        averageCost: 8,
        lastUpdated: new Date(),
        location: 'Main Warehouse',
        status: 'active'
      }
    ];

    this.inventoryItems.set(mockInventoryItems);
  }
}
