import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [AsyncPipe, ProductCardComponent],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  products$!: Observable<Product[]>;

  ngOnInit(): void {
    this.products$ = this.productService.getFeatured();
  }
}
