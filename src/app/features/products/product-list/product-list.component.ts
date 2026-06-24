import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product, ProductFilters, SortOption } from '../../../models/product.model';
import { combineLatest, map, Observable, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

  products$!: Observable<Product[]>;

  readonly categories = [
    { value: 'pro', label: 'Pro' },
    { value: 'ultra', label: 'Ultra' },
    { value: 'slim', label: 'Slim' },
    { value: 'studio', label: 'Studio' },
  ];

  readonly brands = [
    { value: 'rog', label: 'ASUS ROG' },
    { value: 'msi', label: 'MSI' },
    { value: 'dell', label: 'Dell' },
    { value: 'macbook', label: 'MacBook' },
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
  searchQuery = '';

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      categories: this.fb.group({
        pro: [false],
        ultra: [false],
        slim: [false],
        studio: [false],
      }),
      brands: this.fb.group({
        rog: [false],
        msi: [false],
        dell: [false],
        macbook: [false],
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

    const query$ = this.route.queryParamMap.pipe(
      map((params) => params.get('q') ?? ''),
    );

    this.products$ = combineLatest([query$, this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))]).pipe(
      switchMap(([query, formValue]) => {
        this.searchQuery = query;
        const filters = this.buildFilters(formValue, query);
        const sort = formValue.sort as SortOption;
        return this.productService.getFiltered(filters, sort);
      }),
    );
  }

  resetFilters(): void {
    this.filterForm.reset({
      categories: { pro: false, ultra: false, slim: false, studio: false },
      brands: { rog: false, msi: false, dell: false, macbook: false },
      minPrice: null,
      maxPrice: null,
      ram: { '8GB': false, '16GB': false, '32GB': false, '64GB': false },
      storage: { '256GB': false, '512GB': false, '1TB': false, '2TB': false },
      sort: 'newest',
    });
    this.router.navigate(['/products'], { queryParams: {} });
  }

  private buildFilters(formValue: Record<string, unknown>, query: string): ProductFilters {
    return {
      query,
      categories: Object.entries(formValue['categories'] as Record<string, boolean>)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
      brands: Object.entries(formValue['brands'] as Record<string, boolean>)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
      minPrice: (formValue['minPrice'] as number | null) ?? null,
      maxPrice: (formValue['maxPrice'] as number | null) ?? null,
      ram: Object.entries(formValue['ram'] as Record<string, boolean>)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
      storage: Object.entries(formValue['storage'] as Record<string, boolean>)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
    };
  }
}
