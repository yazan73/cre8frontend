import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'cre8-loader-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="active"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="status"
      aria-live="polite"
    >
      <div class="relative flex flex-col items-center gap-4 rounded-3xl bg-[#0f111a] border border-white/10 px-6 py-5 shadow-strong">
        <div class="h-12 w-12 rounded-full bg-gradient-to-r from-accent to-accent-2 animate-spin-slow"></div>
        <div class="text-white font-semibold text-sm sm:text-base text-center">
          {{ message || 'Loading, please wait…' }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host .animate-spin-slow {
        animation: spin 1.2s linear infinite;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoaderOverlayComponent {
  @Input() active = false;
  @Input() message = '';
}
