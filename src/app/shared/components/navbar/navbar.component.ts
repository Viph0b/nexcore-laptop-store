import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { CartService } from '../../../services/cart.service';
import { SidenavService } from '../../../services/sidenav.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly sidenav = inject(SidenavService);
  private readonly productService = inject(ProductService);

  readonly cartCount$ = this.cartService.count$;
  readonly mobileOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly suggestions = signal<{ name: string; price: number }[]>([]);

  readonly navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Compare', path: '/compare' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  private allProducts: { name: string; price: number }[] = [];

  constructor() {
    this.productService.getAll().subscribe((products) => {
      this.allProducts = products.map((p) => ({ name: p.name, price: p.price }));
    });
  }

  toggleSearch(): void {
    this.searchOpen.update((v) => !v);
    if (!this.searchOpen()) {
      this.suggestions.set([]);
    }
  }

  onSearchInput(value: string): void {
    const q = value.trim().toLowerCase();
    if (!q) {
      this.suggestions.set([]);
      return;
    }
    this.suggestions.set(
      this.allProducts
        .filter((p) => p.name.toLowerCase().includes(q))
        .slice(0, 6),
    );
  }

  search(query: string): void {
    const trimmed = query.trim();
    if (trimmed) {
      this.router.navigate(['/products'], { queryParams: { q: trimmed } });
      this.suggestions.set([]);
      this.searchOpen.set(false);
    }
  }

  selectSuggestion(name: string): void {
    this.search(name);
  }

  onBlur(): void {
    setTimeout(() => {
      this.suggestions.set([]);
      this.searchOpen.set(false);
    }, 200);
  }

  openCart(): void {
    this.sidenav.open();
  }
}
