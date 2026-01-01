import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly stream$ = this.toasts$.asObservable();

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const toast: Toast = { id: crypto.randomUUID(), message, type, duration };
    const next = [...this.toasts$.value, toast];
    this.toasts$.next(next);
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  dismiss(id: string) {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }

  clear() {
    this.toasts$.next([]);
  }
}
