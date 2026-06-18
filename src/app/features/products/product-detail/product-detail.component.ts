import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { switchMap, tap } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { CompareService } from '../../../services/compare.service';
import { Product } from '../../../models/product.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

type Tab = 'overview' | 'specifications' | 'reviews';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CurrencyPipe, DatePipe, UpperCasePipe, IconComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly compareService = inject(CompareService);

  product$ = this.route.paramMap.pipe(
    switchMap((params) => this.productService.getById(params.get('id') ?? '')),
  );

  readonly activeTab = signal<Tab>('overview');
  readonly selectedImage = signal(0);
  readonly addedToCart = signal(false);
  readonly compareMessage = signal('');

  ngOnInit(): void {
    this.product$.pipe(tap(() => this.selectedImage.set(0))).subscribe();
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  selectImage(index: number): void {
    this.selectedImage.set(index);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2000);
  }

  toggleCompare(product: Product): void {
    const added = this.compareService.toggle(product.id);
    if (added) {
      this.compareMessage.set('Added to compare');
    } else if (this.compareService.isInCompare(product.id)) {
      this.compareMessage.set('Removed from compare');
    } else {
      this.compareMessage.set('Compare list full (max 3)');
    }
    setTimeout(() => this.compareMessage.set(''), 2000);
  }

  isInCompare(productId: string): boolean {
    return this.compareService.isInCompare(productId);
  }

  getSpecEntries(product: Product): { key: string; value: string }[] {
    const specs = product.specs;
    return [
      { key: 'Processor', value: specs.cpu },
      { key: 'Memory', value: specs.ram },
      { key: 'Storage', value: specs.storage },
      { key: 'Display', value: specs.display },
      ...(specs.gpu ? [{ key: 'Graphics', value: specs.gpu }] : []),
      ...(specs.weight ? [{ key: 'Weight', value: specs.weight }] : []),
      ...(specs.battery ? [{ key: 'Battery', value: specs.battery }] : []),
      ...(specs.os ? [{ key: 'Operating System', value: specs.os }] : []),
    ];
  }
}
