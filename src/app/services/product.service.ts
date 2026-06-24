import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { Product, ProductFilters, SortOption } from '../models/product.model';
import { PRODUCTS } from '../data/products.data';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly products = PRODUCTS;

  getAll(): Observable<Product[]> {
    return of(this.products);
  }

  getFeatured(): Observable<Product[]> {
    return of(this.products.filter((p) => p.featured));
  }

  getById(id: string): Observable<Product | undefined> {
    return of(this.products.find((p) => p.id === id));
  }

  getFiltered(filters: ProductFilters, sort: SortOption): Observable<Product[]> {
    return of(this.products).pipe(
      map((products) => {
        let result = [...products];

        if (filters.query) {
          const q = filters.query.toLowerCase();
          result = result.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.tagline.toLowerCase().includes(q) ||
              p.overview.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.specs.cpu.toLowerCase().includes(q) ||
              p.specs.ram.toLowerCase().includes(q) ||
              p.specs.storage.toLowerCase().includes(q) ||
              (p.specs.gpu && p.specs.gpu.toLowerCase().includes(q)),
          );
        }

        if (filters.categories.length) {
          result = result.filter((p) => filters.categories.includes(p.category));
        }

        if (filters.brands.length) {
          result = result.filter((p) => filters.brands.includes(p.brand));
        }

        if (filters.minPrice !== null) {
          result = result.filter((p) => p.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== null) {
          result = result.filter((p) => p.price <= filters.maxPrice!);
        }

        if (filters.ram.length) {
          result = result.filter((p) =>
            filters.ram.some((r) => p.specs.ram.toLowerCase().includes(r.toLowerCase())),
          );
        }

        if (filters.storage.length) {
          result = result.filter((p) =>
            filters.storage.some((s) => p.specs.storage.toLowerCase().includes(s.toLowerCase())),
          );
        }

        switch (sort) {
          case 'price-asc':
            result.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            result.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
        }

        return result;
      }),
    );
  }

  getByIds(ids: string[]): Observable<Product[]> {
    return of(this.products.filter((p) => ids.includes(p.id)));
  }
}
