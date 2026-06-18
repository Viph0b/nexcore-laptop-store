import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  readonly count$ = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
  );

  readonly total$ = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)),
  );

  addToCart(product: Product, quantity = 1): void {
    const items = [...this.itemsSubject.value];
    const existing = items.find((i) => i.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    this.itemsSubject.next(items);
  }

  removeFromCart(productId: string): void {
    this.itemsSubject.next(this.itemsSubject.value.filter((i) => i.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const items = this.itemsSubject.value.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i,
    );
    this.itemsSubject.next(items);
  }

  clearCart(): void {
    this.itemsSubject.next([]);
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }
}
