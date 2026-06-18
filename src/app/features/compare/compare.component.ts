import { Component, inject } from '@angular/core';
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

  readonly products$ = this.compareService.ids$.pipe(
    switchMap((ids) => this.productService.getByIds(ids)),
  );

  remove(productId: string): void {
    this.compareService.remove(productId);
  }

  clear(): void {
    this.compareService.clear();
  }
}
