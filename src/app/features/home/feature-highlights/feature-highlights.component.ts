import { Component } from '@angular/core';
import { IconComponent, IconName } from '../../../shared/components/icon/icon.component';

interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

@Component({
  selector: 'app-feature-highlights',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './feature-highlights.component.html',
  styleUrl: './feature-highlights.component.css',
})
export class FeatureHighlightsComponent {
  readonly features: Feature[] = [
    {
      icon: 'cpu',
      title: 'Ultra-Slim Design',
      description: 'CNC-machined aluminum chassis under 14mm. Premium materials, impossibly thin profile.',
    },
    {
      icon: 'battery',
      title: 'All-Day Battery',
      description: 'Up to 16 hours of real-world usage. Fast-charge to 50% in under 30 minutes.',
    },
    {
      icon: 'monitor',
      title: 'Pro-Grade Display',
      description: 'OLED and Mini-LED panels with 100% DCI-P3 color accuracy for creative professionals.',
    },
    {
      icon: 'wind',
      title: 'Silent Cooling',
      description: 'Vapor chamber thermal system keeps performance high and noise near zero.',
    },
  ];
}
