import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { FeaturedProductsComponent } from './featured-products/featured-products.component';
import { FeatureHighlightsComponent } from './feature-highlights/feature-highlights.component';
import { ScrollToTopComponent } from '../../shared/components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, FeaturedProductsComponent, FeatureHighlightsComponent, ScrollToTopComponent],
  template: `
    <app-hero />
    <app-featured-products />
    <app-feature-highlights />
    <app-scroll-to-top />
  `,
})
export class HomeComponent {}
