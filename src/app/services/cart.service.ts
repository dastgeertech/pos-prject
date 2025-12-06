import { Injectable, signal, computed } from '@angular/core';
import { Cart, CartItem, Transaction } from '../models/cart.model';
import { Product } from '../models/product.model';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = signal<Cart>({
    id: uuid(),
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    discountType: 'percentage',
    total: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  private transactions = signal<Transaction[]>([]);

  cart$ = computed(() => this.cart());
  items$ = computed(() => this.cart().items);
  subtotal$ = computed(() => this.cart().subtotal);
  tax$ = computed(() => this.cart().tax);
  discount$ = computed(() => this.cart().discount);
  total$ = computed(() => this.cart().total);
  transactions$ = computed(() => this.transactions());

  constructor() {}

  addItem(product: Product, quantity: number = 1): CartItem {
    const existingItem = this.cart().items.find(item => item.product.id === product.id);

    if (existingItem) {
      return this.updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
    }

    const cartItem: CartItem = {
      id: uuid(),
      product,
      quantity,
      unitPrice: product.price,
      discount: 0,
      discountType: 'percentage',
      tax: 0,
      subtotal: product.price * quantity,
      total: product.price * quantity
    };

    this.cart.update(cart => ({
      ...cart,
      items: [...cart.items, cartItem],
      updatedAt: new Date()
    }));

    this.recalculateTotals();
    return cartItem;
  }

  removeItem(itemId: string): void {
    this.cart.update(cart => ({
      ...cart,
      items: cart.items.filter(item => item.id !== itemId),
      updatedAt: new Date()
    }));
    this.recalculateTotals();
  }

  updateItemQuantity(itemId: string, quantity: number): CartItem {
    let updatedItem: CartItem | undefined;

    this.cart.update(cart => ({
      ...cart,
      items: cart.items.map(item => {
        if (item.id === itemId) {
          updatedItem = {
            ...item,
            quantity: Math.max(1, quantity),
            subtotal: item.unitPrice * Math.max(1, quantity),
            total: (item.unitPrice * Math.max(1, quantity)) - item.discount + item.tax
          };
          return updatedItem;
        }
        return item;
      }),
      updatedAt: new Date()
    }));

    this.recalculateTotals();
    return updatedItem!;
  }

  applyDiscount(itemId: string, discount: number, type: 'percentage' | 'fixed' = 'percentage'): void {
    this.cart.update(cart => ({
      ...cart,
      items: cart.items.map(item => {
        if (item.id === itemId) {
          const discountAmount = type === 'percentage'
            ? (item.subtotal * discount) / 100
            : discount;
          return {
            ...item,
            discount: discountAmount,
            discountType: type,
            total: item.subtotal - discountAmount + item.tax
          };
        }
        return item;
      }),
      updatedAt: new Date()
    }));

    this.recalculateTotals();
  }

  applyCartDiscount(discount: number, type: 'percentage' | 'fixed' = 'percentage'): void {
    const subtotal = this.cart().subtotal;
    const discountAmount = type === 'percentage'
      ? (subtotal * discount) / 100
      : discount;

    this.cart.update(cart => ({
      ...cart,
      discount: discountAmount,
      updatedAt: new Date()
    }));

    this.recalculateTotals();
  }

  private recalculateTotals(): void {
    const items = this.cart().items;
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    const itemDiscounts = items.reduce((sum, item) => sum + item.discount, 0);
    const cartDiscount = this.cart().discount;
    const total = subtotal - itemDiscounts - cartDiscount + tax;

    this.cart.update(cart => ({
      ...cart,
      subtotal,
      tax,
      discount: itemDiscounts + cartDiscount,
      total: Math.max(0, total)
    }));
  }

  clearCart(): void {
    this.cart.set({
      id: uuid(),
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      discountType: 'percentage',
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  completeTransaction(paymentMethod: string): Transaction {
    const transaction: Transaction = {
      id: uuid(),
      cartId: this.cart().id,
      amount: this.cart().total,
      paymentMethod: paymentMethod as any,
      status: 'completed',
      timestamp: new Date()
    };

    this.transactions.update(trans => [...trans, transaction]);
    this.clearCart();
    return transaction;
  }

  getTransactions(): Transaction[] {
    return this.transactions();
  }

  getCartItems(): CartItem[] {
    return this.cart().items;
  }

  getCartTotal(): number {
    return this.cart().total;
  }
}
