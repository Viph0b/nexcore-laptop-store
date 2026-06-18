import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product, ProductFilters, SortOption } from '../../../models/product.model';
import { Observable, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  products$!: Observable<Product[]>;

  readonly categories = [
    { value: 'pro', label: 'Pro' },
    { value: 'ultra', label: 'Ultra' },
    { value: 'slim', label: 'Slim' },
    { value: 'studio', label: 'Studio' },
  ];

  readonly ramOptions = ['8GB', '16GB', '32GB', '64GB'];
  readonly storageOptions = ['256GB', '512GB', '1TB', '2TB'];

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
  ];

  filterForm!: FormGroup;

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      categories: this.fb.group({
        pro: [false],
        ultra: [false],
        slim: [false],
        studio: [false],
      }),
      minPrice: [null as number | null],
      maxPrice: [null as number | null],
      ram: this.fb.group({
        '8GB': [false],
        '16GB': [false],
        '32GB': [false],
        '64GB': [false],
      }),
      storage: this.fb.group({
        '256GB': [false],
        '512GB': [false],
        '1TB': [false],
        '2TB': [false],
      }),
      sort: ['newest' as SortOption],
    });

    this.products$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      switchMap(() => {
        const filters = this.buildFilters();
        const sort = this.filterForm.get('sort')?.value as SortOption;
        return this.productService.getFiltered(filters, sort);
      }),
    );
  }

  resetFilters(): void {
    this.filterForm.reset({
      categories: { pro: false, ultra: false, slim: false, studio: false },
      minPrice: null,
      maxPrice: null,
      ram: { '8GB': false, '16GB': false, '32GB': false, '64GB': false },
      storage: { '256GB': false, '512GB': false, '1TB': false, '2TB': false },
      sort: 'newest',
    });
  }

  private buildFilters(): ProductFilters {
    const v = this.filterForm.value;
    return {
      categories: Object.entries(v.categories)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
      minPrice: v.minPrice ?? null,
      maxPrice: v.maxPrice ?? null,
      ram: Object.entries(v.ram)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
      storage: Object.entries(v.storage)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
    };
  }
}
