import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const MAX_COMPARE = 3;

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly idsSubject = new BehaviorSubject<string[]>([]);
  readonly ids$ = this.idsSubject.asObservable();

  toggle(productId: string): boolean {
    const current = this.idsSubject.value;
    const index = current.indexOf(productId);

    if (index >= 0) {
      this.idsSubject.next(current.filter((id) => id !== productId));
      return false;
    }

    if (current.length >= MAX_COMPARE) {
      return false;
    }

    this.idsSubject.next([...current, productId]);
    return true;
  }

  isInCompare(productId: string): boolean {
    return this.idsSubject.value.includes(productId);
  }

  remove(productId: string): void {
    this.idsSubject.next(this.idsSubject.value.filter((id) => id !== productId));
  }

  clear(): void {
    this.idsSubject.next([]);
  }

  getIds(): string[] {
    return this.idsSubject.value;
  }
}
