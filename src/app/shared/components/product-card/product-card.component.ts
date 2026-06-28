import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../models/product.model';
import { CompareService } from '../../../services/compare.service';

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

  constructor(private readonly compareService: CompareService) {}

  get compared(): boolean {
    return this.compareService.isInCompare(this.product().id);
  }

  toggleCompare(): void {
    this.compareService.toggle(this.product().id);
  }

  addToCart(): void {
    this.added = true;
    setTimeout(() => this.added = false, 1500);
  }
}
