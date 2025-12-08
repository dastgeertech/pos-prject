import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { InvoiceService } from '../../services/invoice.service';
import { ProductService } from '../../services/product.service';
import { Invoice } from '../../services/invoice.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.html',
  styleUrl: './sales.scss'
})
export class Sales {
  searchQuery: string = '';
  cartItems: any[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private invoiceService: InvoiceService,
    private productService: ProductService
  ) {
    effect(() => {
      this.cartItems = this.cartService.items$();
      this.calculateTotal();
    });
  }

  addToCart() {
    if (this.searchQuery) {
      const product = this.productService.getProductById(this.searchQuery);
      if (product) {
        this.cartService.addItem(product);
        this.searchQuery = '';
      }
    }
  }

  removeFromCart(itemId: string) {
    this.cartService.removeItem(itemId);
  }

  calculateTotal() {
    this.total = this.cartService.getCartTotal();
  }

  generateInvoice() {
    const transaction = this.cartService.completeTransaction('cash'); // Assuming cash payment for simplicity
    const invoice: Invoice = this.invoiceService.generateInvoice(transaction, this.cartService.cart$(), undefined);
    console.log('Invoice generated:', invoice);
    // TODO: Display or print invoice
  }
}
