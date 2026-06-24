import { AfterViewInit, Component, ElementRef, ViewChild, PLATFORM_ID, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgIf, isPlatformBrowser } from '@angular/common';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIf, RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent implements AfterViewInit {
  readonly product = input.required<Product>();
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('specsText') specsText?: ElementRef<HTMLParagraphElement>;
  specsOverflow = false;
  showFullSpecs = false;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.specsText?.nativeElement;
    if (el) {
      requestAnimationFrame(() => {
        this.specsOverflow = el.scrollWidth > el.clientWidth;
      });
    }
  }

  toggleSpecs() {
    this.showFullSpecs = !this.showFullSpecs;
  }
}
