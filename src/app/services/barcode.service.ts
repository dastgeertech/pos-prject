import { Injectable, signal, computed } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private isScanning = signal<boolean>(false);
  private scannedCode = signal<string>('');
  private lastScannedProduct = signal<Product | null>(null);

  isScanning$ = computed(() => this.isScanning());
  scannedCode$ = computed(() => this.scannedCode());
  lastScannedProduct$ = computed(() => this.lastScannedProduct());

  constructor(private productService: ProductService) {}

  startScanning() {
    this.isScanning.set(true);
    this.scannedCode.set('');
    this.lastScannedProduct.set(null);
  }

  stopScanning() {
    this.isScanning.set(false);
  }

  scanBarcode(code: string): Product | null {
    this.scannedCode.set(code);
    
    // Find product by barcode/SKU
    const product = this.productService.getProducts().find(p => 
      p.sku === code || 
      p.barcode === code
    );
    
    if (product) {
      this.lastScannedProduct.set(product);
      this.stopScanning();
      return product;
    }
    
    return null;
  }

  simulateBarcodeScan(): Product | null {
    // Simulate barcode scanning for demo
    const mockBarcodes = [
      { sku: 'LAP001', barcode: '1234567890123' },
      { sku: 'MOU001', barcode: '2345678901234' },
      { sku: 'TSH001', barcode: '3456789012345' },
      { sku: 'COF001', barcode: '4567890123456' }
    ];
    
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    return this.scanBarcode(randomBarcode.barcode);
  }

  clearScan() {
    this.scannedCode.set('');
    this.lastScannedProduct.set(null);
  }

  // Generate mock barcode for products that don't have one
  generateBarcode(sku: string): string {
    const hash = this.hashCode(sku);
    return Math.abs(hash).toString().padStart(13, '0').slice(0, 13);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}
