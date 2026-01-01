import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'cre8-product-selection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section
      class="rounded-[32px] border border-accent/60 bg-surface/80 backdrop-blur-xl shadow-strong p-6 sm:p-10"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-text-muted">Step 1</p>
          <h2 class="text-3xl font-bold">Choose your canvas</h2>
          <p class="text-text-muted max-w-xl">
            Pick a base to start designing. Your choice stays with you through the session.
          </p>
        </div>
        <a
          routerLink="/"
          class="text-sm font-semibold text-white underline hover:text-accent transition"
        >
          Back to welcome
        </a>
      </div>

      <div class="mt-8 grid gap-6 sm:grid-cols-2">
        <ng-container *ngIf="products$ | async as products; else loading">
          <ng-container *ngIf="products.length; else empty">
            <div
              *ngFor="let product of products"
              class="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-soft space-y-4"
            >
              <div
                class="overflow-hidden rounded-[22px] border border-white/10 shadow-soft aspect-[3/4] bg-[#0f1018]"
              >
                <img
                  [src]="resolveImage(product)"
                  [alt]="product.type"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div class="flex items-center justify-between">
                <div class="text-lg font-semibold capitalize">{{ product.type }}</div>
                <button
                  class="px-4 py-2 rounded-full bg-gradient-to-r from-accent to-accent-2 text-black font-semibold shadow-soft hover:-translate-y-0.5 transition transform"
                  (click)="selectProduct(product)"
                >
                  Select
                </button>
              </div>
            </div>
          </ng-container>
        </ng-container>
      </div>

      <ng-template #loading>
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="h-80 rounded-[24px] border border-white/10 bg-white/5 animate-pulse"></div>
          <div class="h-80 rounded-[24px] border border-white/10 bg-white/5 animate-pulse"></div>
        </div>
      </ng-template>

      <ng-template #empty>
        <div class="text-text-muted text-center py-8">No products available yet.</div>
      </ng-template>
    </section>
  `,
})
export class ProductSelectionComponent {
  products$: Observable<Product[]>;

  constructor(private productService: ProductService, private router: Router) {
    this.products$ = this.productService.getAll();
  }

  resolveImage(product: Product): string {
    if (product.frontImageUrl) return product.frontImageUrl;
    const fallback: Record<string, string> = {
      t_shirt:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      hoodie:
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    };
    return fallback[product.type] ?? fallback['t_shirt'];
  }

  selectProduct(product: Product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    this.router.navigateByUrl(`/design/product/${product.id}`);
  }
}
