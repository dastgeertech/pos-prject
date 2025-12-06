import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  cartItems: CartItem[] = [];
  categories: any[] = [];
  selectedCategory: string = '';
  searchQuery: string = '';
  cartTotal = 0;
  cartSubtotal = 0;
  cartTax = 0;
  paymentMethod: string = 'cash';
  showPaymentModal = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.products = this.productService.getProducts();
  }

  loadCategories() {
    this.categories = this.productService.getCategories();
  }

  filterProducts() {
    let filtered = this.productService.getProducts();

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      filtered = this.productService.searchProducts(this.searchQuery);
    }

    this.products = filtered;
  }

  addToCart(product: Product) {
    this.cartService.addItem(product, 1);
    this.updateCartDisplay();
  }

  removeFromCart(itemId: string) {
    this.cartService.removeItem(itemId);
    this.updateCartDisplay();
  }

  updateQuantity(itemId: string, quantity: number) {
    if (quantity > 0) {
      this.cartService.updateItemQuantity(itemId, quantity);
      this.updateCartDisplay();
    }
  }

  updateCartDisplay() {
    this.cartItems = this.cartService.getCartItems();
    this.cartTotal = this.cartService.getCartTotal();
    this.cartSubtotal = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.cartTax = this.cartItems.reduce((sum, item) => sum + item.tax, 0);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
      this.cartService.clearCart();
      this.updateCartDisplay();
    }
  }

  completeTransaction() {
    if (this.cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }
    this.showPaymentModal = true;
  }

  processPayment() {
    const transaction = this.cartService.completeTransaction(this.paymentMethod);
    alert(`Transaction completed! ID: ${transaction.id}`);
    this.showPaymentModal = false;
    this.updateCartDisplay();
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  onCategoryChange(categoryId: string) {
    this.selectedCategory = categoryId;
    this.filterProducts();
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.filterProducts();
  }
}
