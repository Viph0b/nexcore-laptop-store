import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  template: `
    @if (visible()) {
      <button class="scroll-to-top" (click)="scrollToTop()" aria-label="Scroll to top">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    }
  `,
  styles: [`
    .scroll-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 1100;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #2d5be3;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(45, 91, 227, 0.35);
      transition: opacity 0.25s ease, transform 0.25s ease, background 0.2s ease;
      animation: scroll-top-in 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .scroll-to-top:hover {
      background: #3d6bf5;
      transform: translateY(-2px);
    }
    @keyframes scroll-top-in {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ScrollToTopComponent {
  readonly visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > 400);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
