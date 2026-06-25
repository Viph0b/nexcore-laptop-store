import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
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

  collapsedSections: Record<string, boolean> = {
    category: false,
    brand: false,
    price: false,
    ram: false,
    storage: false,
  };

  readonly priceMin = 0;
  readonly priceMax = 5000;
  readonly priceStep = 100;

  get activeFilterCount(): number {
    if (!this.filterForm) return 0;
    const v = this.filterForm.value;
    let count = 0;
    const cats = v.categories as Record<string, boolean>;
    const brds = v.brands as Record<string, boolean>;
    const ram = v.ram as Record<string, boolean>;
    const storage = v.storage as Record<string, boolean>;
    if (cats) for (const x of Object.values(cats)) if (x) count++;
    if (brds) for (const x of Object.values(brds)) if (x) count++;
    if (ram) for (const x of Object.values(ram)) if (x) count++;
    if (storage) for (const x of Object.values(storage)) if (x) count++;
    if ((v.minPrice ?? 0) > this.priceMin) count++;
    if ((v.maxPrice ?? this.priceMax) < this.priceMax) count++;
    return count;
  }

  get minPriceVal(): number {
    return this.filterForm?.get('minPrice')?.value ?? this.priceMin;
  }

  get maxPriceVal(): number {
    return this.filterForm?.get('maxPrice')?.value ?? this.priceMax;
  }

  get minPricePercent(): number {
    return ((this.minPriceVal - this.priceMin) / (this.priceMax - this.priceMin)) * 100;
  }

  get maxPricePercent(): number {
    return ((this.maxPriceVal - this.priceMin) / (this.priceMax - this.priceMin)) * 100;
  }

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
      minPrice: [this.priceMin],
      maxPrice: [this.priceMax],
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

  toggleSection(section: string): void {
    this.collapsedSections[section] = !this.collapsedSections[section];
  }

  onMinPriceInput(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    const max = this.filterForm.get('maxPrice')?.value ?? this.priceMax;
    if (val < max) {
      this.filterForm.patchValue({ minPrice: val });
    }
  }

  onMaxPriceInput(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    const min = this.filterForm.get('minPrice')?.value ?? this.priceMin;
    if (val > min) {
      this.filterForm.patchValue({ maxPrice: val });
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      categories: { pro: false, ultra: false, slim: false, studio: false },
      brands: { rog: false, msi: false, dell: false, macbook: false },
      minPrice: this.priceMin,
      maxPrice: this.priceMax,
      ram: { '8GB': false, '16GB': false, '32GB': false, '64GB': false },
      storage: { '256GB': false, '512GB': false, '1TB': false, '2TB': false },
      sort: 'newest',
    });
    this.router.navigate(['/products'], { queryParams: {} });
  }

  private buildFilters(formValue: Record<string, unknown>, query: string): ProductFilters {
    const rawMin = formValue['minPrice'] as number;
    const rawMax = formValue['maxPrice'] as number;
    return {
      query,
      categories: Object.entries(formValue['categories'] as Record<string, boolean>)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
      brands: Object.entries(formValue['brands'] as Record<string, boolean>)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
      minPrice: rawMin > this.priceMin ? rawMin : null,
      maxPrice: rawMax < this.priceMax ? rawMax : null,
      ram: Object.entries(formValue['ram'] as Record<string, boolean>)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
      storage: Object.entries(formValue['storage'] as Record<string, boolean>)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
    };
  }
}
