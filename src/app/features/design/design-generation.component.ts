import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ProductService, Product } from '../../services/product.service';
import { LoaderOverlayComponent } from '../../shared/ui/loader-overlay.component';
import { SelectComponent, SelectOption } from '../../shared/ui/select.component';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'cre8-design-generation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    LoaderOverlayComponent,
    SelectComponent,
    ToastContainerComponent,
  ],
  template: `
    <section class="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div
        class="max-w-[1000px] w-full rounded-[32px] border border-accent/60 bg-surface/80 backdrop-blur-xl shadow-strong p-5 sm:p-8 space-y-6 flex flex-col min-h-[55vh]"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p class="text-sm text-text-muted">Step 2</p>
            <h2 class="text-3xl font-bold">AI Prompt & Upload</h2>
            <p class="text-text-muted max-w-2xl">
              Describe your design or drop your artwork. We’ll generate or process it for your selected
              product.
            </p>
          </div>
          <a
            routerLink="/product-selection"
            class="px-4 py-2 rounded-full bg-white text-black font-semibold shadow-soft hover:-translate-y-0.5 transition transform"
          >
            Back to selection
          </a>
        </div>

        <div class="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8 shadow-soft space-y-6 flex-1">
          <div class="text-center space-y-2">
            <div class="text-2xl sm:text-3xl font-bold">Write a short prompt</div>
            <p class="text-text-muted">Tell us what you want to see on your product.</p>
          </div>

          <form class="space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
            <textarea
              formControlName="prompt"
              rows="6"
              class="w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent resize-none min-h-[160px]"
              placeholder="Create a..."
            ></textarea>
            <div class="flex flex-col gap-3">
              <cre8-select
                label="Image ratio"
                [options]="sizeOptions"
                [placeholder]="'Choose size'"
                [ngModel]="selectedSize"
                (changed)="onSizeChange($event)"
              />
              <div class="flex gap-3 flex-wrap justify-end">
                <label
                  class="px-4 py-2 rounded-full bg-gradient-to-r from-accent to-accent-2 text-black font-semibold shadow-soft hover:-translate-y-0.5 transition transform cursor-pointer"
                >
                  Upload Design
                  <input type="file" class="hidden" (change)="onFileChange($event)" accept="image/*" />
                </label>
                <button
                  type="submit"
                  [disabled]="submitting || (form.invalid && !selectedFile)"
                  class="px-6 py-2 rounded-full bg-white text-black font-semibold shadow-soft hover:-translate-y-0.5 transition transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Submitting…' : 'Submit & edit' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
    <cre8-toast-container />
    <cre8-loader-overlay [active]="submitting" message="Preparing your design..." />
  `,
})
export class DesignGenerationComponent implements OnInit {
  form = this.fb.nonNullable.group({
    prompt: ['', [Validators.required, Validators.minLength(4)]],
    size: ['1024x1024'],
  });
  selectedFile: File | null = null;
  submitting = false;
  product: Product | null = null;
  selectedSize = '1024x1024';
  sizeOptions: SelectOption[] = [
    { value: '1024x1024', label: 'Square (1024x1024)' },
    { value: '1024x1536', label: 'Portrait (1024x1536)' },
    { value: '1536x1024', label: 'Landscape (1536x1024)' },
    { value: 'auto', label: 'Auto' },
  ];

  constructor(
    private fb: FormBuilder,
    private orders: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private products: ProductService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('productId');
      if (!productId) {
        this.router.navigateByUrl('/product-selection');
        return;
      }
      this.form.patchValue({ size: this.selectedSize });
      this.products.getById(productId).subscribe({
        next: (product) => {
          this.product = product;
          localStorage.setItem('selectedProduct', JSON.stringify(product));
        },
        error: () => {
          this.router.navigateByUrl('/product-selection');
        },
      });
    });
  }

  pasteBasePrompt() {
    this.form.patchValue({
      prompt: 'Create a bold, futuristic graphic featuring neon accents and clean typography.',
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) {
      this.selectedFile = null;
      return;
    }
    this.selectedFile = input.files[0];
    this.onSubmit();
  }

  onSizeChange(val: string | number | null) {
    const size = (val as string) || '1024x1024';
    this.selectedSize = size;
    this.form.patchValue({ size });
  }

  onSubmit() {
    if (this.form.invalid && !this.selectedFile) return;
    const product = this.product || this.getStoredProduct();
    if (!product) {
      this.router.navigateByUrl('/product-selection');
      return;
    }
    this.submitting = true;
    this.toast.show('Preparing your design...', 'info');
    this.orders
      .create({
        productId: product.id,
        prompt: this.form.value.prompt,
        file: this.selectedFile || undefined,
        size: this.selectedSize || this.form.value.size || undefined,
      })
      .subscribe({
        next: (order) => {
          this.submitting = false;
          const path = `/editor/product/${product.id}/order/${order.id}`;
          this.toast.show('Design created! Opening editor.', 'success');
          this.router.navigateByUrl(path);
        },
        error: () => {
          this.submitting = false;
          this.toast.show('Failed to create design. Please try again.', 'error');
        },
      });
  }

  private getStoredProduct(): Product | null {
    const stored = localStorage.getItem('selectedProduct');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as Product;
    } catch {
      return null;
    }
  }
}
