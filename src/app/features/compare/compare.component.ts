import { Component, inject, DestroyRef, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { switchMap } from 'rxjs';
import { CompareService } from '../../services/compare.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CurrencyPipe],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.css',
})
export class CompareComponent {
  private readonly compareService = inject(CompareService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products$ = this.compareService.ids$.pipe(
    switchMap((ids) => this.productService.getByIds(ids)),
  );

  constructor() {
    const sub = this.products$.subscribe(() => {
      afterNextRender(() => {
        this.setProductCount();
      });
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  remove(productId: string): void {
    this.compareService.remove(productId);
  }

  clear(): void {
    this.compareService.clear();
  }

  private setProductCount(): void {
    const productCount = document.querySelectorAll('.compare__product-header').length;
    const table = document.querySelector('.compare__table');
    if (table && productCount > 0) {
      (table as HTMLElement).style.setProperty('--product-count', String(productCount));
    }
  }
}
