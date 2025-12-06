import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarcodeService } from '../../services/barcode.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.scss'
})
export class BarcodeScannerComponent {
  isScanning$: any;
  scannedCode$: any;
  lastScannedProduct$: any;

  constructor(
    private barcodeService: BarcodeService,
    private cartService: CartService
  ) {
    this.isScanning$ = this.barcodeService.isScanning$;
    this.scannedCode$ = this.barcodeService.scannedCode$;
    this.lastScannedProduct$ = this.barcodeService.lastScannedProduct$;
  }

  startScanning() {
    this.barcodeService.startScanning();
  }

  stopScanning() {
    this.barcodeService.stopScanning();
  }

  simulateScan() {
    const product = this.barcodeService.simulateBarcodeScan();
    if (product) {
      this.addToCart(product);
    }
  }

  addToCart(product: Product) {
    this.cartService.addItem(product, 1);
  }

  clearScan() {
    this.barcodeService.clearScan();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}
