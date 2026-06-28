import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../models/product.model';
import { CartService } from '../../../services/cart.service';
import { CompareService } from '../../../services/compare.service';
import { SidenavService } from '../../../services/sidenav.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  added = false;

  private readonly cartService = inject(CartService);
  private readonly compareService = inject(CompareService);
  private readonly sidenavService = inject(SidenavService);

  get compared(): boolean {
    return this.compareService.isInCompare(this.product().id);
  }

  toggleCompare(): void {
    this.compareService.toggle(this.product().id);
  }

  addToCart(): void {
    this.cartService.addToCart(this.product());
    this.added = true;
    setTimeout(() => (this.added = false), 1000);
  }
}
