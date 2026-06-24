import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { CartService } from '../../../services/cart.service';
import { SidenavService } from '../../../services/sidenav.service';

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

  readonly cartCount$ = this.cartService.count$;
  readonly mobileOpen = signal(false);
  readonly searchOpen = signal(false);

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

  toggleSearch(): void {
    this.searchOpen.update((v) => !v);
  }

  search(query: string): void {
    const trimmed = query.trim();
    if (trimmed) {
      this.router.navigate(['/products'], { queryParams: { q: trimmed } });
      this.searchOpen.set(false);
    }
  }

  openCart(): void {
    this.sidenav.open();
  }
}
