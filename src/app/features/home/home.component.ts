import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { FeaturedProductsComponent } from './featured-products/featured-products.component';
import { FeatureHighlightsComponent } from './feature-highlights/feature-highlights.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, FeaturedProductsComponent, FeatureHighlightsComponent],
  template: `
    <app-hero />
    <app-featured-products />
    <app-feature-highlights />
  `,
})
export class HomeComponent {}
