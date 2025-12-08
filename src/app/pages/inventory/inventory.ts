import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryItem, StockMovement, InventoryAlert } from '../../services/inventory.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class Inventory {
  inventoryItems: InventoryItem[] = [];
  stockMovements: StockMovement[] = [];
  alerts: InventoryAlert[] = [];
  selectedTab: 'overview' | 'items' | 'movements' | 'alerts' | 'orders' = 'overview';
  searchQuery: string = '';

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService
  ) {
    effect(() => {
      this.inventoryItems = this.inventoryService.inventoryItems$();
      this.stockMovements = this.inventoryService.stockMovements$();
      this.alerts = this.inventoryService.alerts$();
    });
  }

  getLowStockItems(): InventoryItem[] {
    return this.inventoryItems.filter(item => 
      item.currentStock <= item.reorderPoint && item.status === 'active'
    );
  }

  getOutOfStockItems(): InventoryItem[] {
    return this.inventoryItems.filter(item => 
      item.currentStock === 0 && item.status === 'active'
    );
  }

  getTotalInventoryValue(): number {
    return this.inventoryItems.reduce((sum, item) => 
      sum + (item.currentStock * item.averageCost), 0
    );
  }

  updateStock(item: InventoryItem, quantity: number, type: StockMovement['type'], reason?: string) {
    this.inventoryService.updateStock(
      item.productId,
      quantity,
      type,
      undefined,
      reason
    );
  }

  searchInventory() {
    // Implement search functionality
    const products = this.productService.searchProducts(this.searchQuery);
    return this.inventoryItems.filter(item => 
      products.some(p => p.id === item.productId)
    );
  }

  getProductName(inventoryItemId: string): string {
    const item = this.inventoryItems.find(i => i.id === inventoryItemId);
    return item?.product?.name || 'Unknown';
  }
}
