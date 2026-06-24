export interface ProductSpecs {
  cpu: string;
  ram: string;
  storage: string;
  display: string;
  gpu?: string;
  weight?: string;
  battery?: string;
  os?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  price: number;
  category: 'pro' | 'ultra' | 'slim' | 'studio';
  brand: 'msi' | 'rog' | 'macbook' | 'dell';
  specs: ProductSpecs;
  images: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  overview: string;
  reviews: ProductReview[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'rating';

export interface ProductFilters {
  query: string;
  categories: string[];
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
  ram: string[];
  storage: string[];
}
