import { RenderMode, ServerRoute } from '@angular/ssr';
import { PRODUCTS } from './data/products.data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return PRODUCTS.map((product) => ({ id: product.id }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
