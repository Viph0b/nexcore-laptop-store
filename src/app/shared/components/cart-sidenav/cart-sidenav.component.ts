import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { SidenavService } from '../../../services/sidenav.service';

@Component({
  selector: 'app-cart-sidenav',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './cart-sidenav.component.html',
  styleUrls: ['./cart-sidenav.component.css'],
})
export class CartSidenavComponent {
  private readonly cart = inject(CartService);
  readonly sidenav = inject(SidenavService);

  readonly items$ = this.cart.items$;
  readonly total$ = this.cart.total$;

  close(): void {
    this.sidenav.close();
  }

  remove(productId: string): void {
    this.cart.removeFromCart(productId);
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cart.updateQuantity(productId, Number(quantity));
  }
}
