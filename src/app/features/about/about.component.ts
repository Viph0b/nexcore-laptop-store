import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LaptopCanvasComponent } from '../../shared/components/laptop-canvas/laptop-canvas.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, LaptopCanvasComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {}
