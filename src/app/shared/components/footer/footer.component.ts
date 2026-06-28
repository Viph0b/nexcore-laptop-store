import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly emailControl = new FormControl('');

  readonly productLinks = [
    { label: 'Pro 14', path: '/products' },
    { label: 'Ultra 16', path: '/products' },
    { label: 'Slim 13', path: '/products' },
    { label: 'Studio 15', path: '/products' },
  ];

  readonly companyLinks = [
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Compare', path: '/compare' },
    { label: 'All Products', path: '/products' },
  ];

  onSubscribe(): void {
    if (this.emailControl.value) {
      this.emailControl.reset();
    }
  }
}
