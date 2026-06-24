import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgIf } from '@angular/common';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIf, RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
}
