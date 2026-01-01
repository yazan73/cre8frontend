import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'cre8-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-80">
      <div
        *ngFor="let toast of toasts"
        class="rounded-xl px-4 py-3 shadow-lg border border-white/10 text-sm text-white backdrop-blur bg-black/70"
        [ngClass]="{
          'border-green-400/60 bg-green-500/20': toast.type === 'success',
          'border-red-400/60 bg-red-500/20': toast.type === 'error',
          'border-white/15 bg-white/10': toast.type === 'info'
        }"
      >
        <div class="flex items-start justify-between gap-2">
          <span>{{ toast.message }}</span>
          <button
            class="text-xs text-white/80 hover:text-white"
            (click)="dismiss(toast.id)"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ToastContainerComponent implements OnDestroy {
  toasts: Toast[] = [];
  private sub: Subscription;

  constructor(private readonly toastService: ToastService) {
    this.sub = this.toastService.stream$.subscribe((list) => (this.toasts = list));
  }

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
