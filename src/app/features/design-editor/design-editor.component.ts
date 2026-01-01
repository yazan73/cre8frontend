import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Canvas, FabricImage, Point, Textbox, FabricObject } from 'fabric';
import { environment } from '../../../environments/environment';
import { SelectComponent, SelectOption } from '../../shared/ui/select.component';
import { ProductService, Product } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';
import { ToastService } from '../../shared/ui/toast.service';
import { DesignExportService } from './design-export.service';
import { LoaderOverlayComponent } from '../../shared/ui/loader-overlay.component';

type StoredProduct = {
  id?: string;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
};

@Component({
  selector: 'cre8-design-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule, FormsModule, SelectComponent, ToastContainerComponent, LoaderOverlayComponent],
  template: `
    <section
      class="rounded-[32px] border border-accent/60 bg-surface/80 backdrop-blur-xl shadow-strong p-4 sm:p-6 lg:p-8 grid gap-6 lg:grid-cols-[280px_1fr]"
    >
      <div class="space-y-4">
        <div class="rounded-[18px] border border-white/10 bg-white/5 p-3 shadow-soft">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold">Designs</span>
            <a
              [routerLink]=" ['/design/product', selectedProduct?.id] "
              class="text-xs underline text-text-muted hover:text-white"
            >
              Back
            </a>
          </div>
          <div class="mt-3 space-y-3">
            <div class="space-y-2">
              <button
                class="w-full px-4 py-3 rounded-[14px] bg-gradient-to-r from-accent to-accent-2 text-black font-semibold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="!designs.length"
                (click)="selectDesign(0)"
              >
                Design 01
              </button>
              <button
                *ngIf="designs.length > 1"
                class="w-full px-4 py-3 rounded-[14px] bg-gradient-to-r from-accent to-accent-2 text-black font-semibold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                (click)="selectDesign(1)"
              >
                Design 02
              </button>
            </div>
            <div class="space-y-2">
              <cre8-select
                label="Pick more"
                [options]="designOptions"
                [placeholder]="'Select design'"
                [(ngModel)]="selectedDesignModel"
                (ngModelChange)="onDesignSelect($event)"
              />
            </div>
          </div>
        </div>

        <div class="rounded-[18px] border border-white/10 bg-white/5 p-3 shadow-soft space-y-3">
          <div class="text-sm font-semibold">Elements</div>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="px-3 py-2 rounded-[12px] bg-gradient-to-r from-accent to-accent-2 text-black font-semibold"
              (click)="rotateSelected()"
            >
              Rotate
            </button>
            <button
              class="px-3 py-2 rounded-[12px] bg-white/10 border border-white/15 text-white font-semibold"
              (click)="deleteSelected()"
            >
              Delete
            </button>
            <button
              class="px-3 py-2 rounded-[12px] bg-white/10 border border-white/15 text-white font-semibold"
              (click)="resetView()"
            >
              Reset
            </button>
          </div>
        </div>

        <div class="rounded-[18px] border border-white/10 bg-white/5 p-3 shadow-soft space-y-3">
          <div class="text-sm font-semibold">Add Text</div>
          <div class="space-y-2">
            <label class="text-xs text-text-muted">Content</label>
            <input
              type="text"
              [value]="textInput"
              (input)="textInput = $any($event.target).value"
              class="w-full rounded-[12px] bg-white/10 border border-white/15 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Type your text"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs text-text-muted">Font</label>
            <div class="relative">
              <cre8-select
                [options]="fontOptions"
                [placeholder]="'Select font'"
                [ngModel]="selectedFont"
                (changed)="selectedFont = $any($event)"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs text-text-muted">Color</label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                [value]="selectedColor"
                (input)="selectedColor = $any($event.target).value"
                class="h-10 w-14 rounded cursor-pointer bg-transparent border border-white/15"
              />
              <input
                type="text"
                [value]="selectedColor"
                (input)="selectedColor = $any($event.target).value"
                class="flex-1 rounded-[12px] bg-white/10 border border-white/15 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <button
            class="w-full px-4 py-3 rounded-[14px] bg-gradient-to-r from-accent to-accent-2 text-black font-semibold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
            (click)="addText()"
            [disabled]="!textInput.trim()"
          >
            Add Text to Canvas
          </button>
        </div>
      </div>

      <div class="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-soft space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-x-2">
            <button
              class="px-3 py-2 rounded-full bg-white text-black font-semibold"
              (click)="switchView('front')"
            >
              Front
            </button>
            <button
              class="px-3 py-2 rounded-full bg-white/10 border border-white/15 text-white font-semibold"
              (click)="switchView('back')"
            >
              Back
            </button>
          </div>
          <div class="text-text-muted text-sm">Zoom: {{ zoom | number: '1.1-1' }}x</div>
        </div>

        <div class="bg-[#0a0b10] rounded-[22px] border border-white/10 p-3">
          <div class="relative w-full">
            <canvas #canvas class="w-full h-[640px]"></canvas>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 justify-between">
          <div class="flex gap-2">
            <button
              class="px-4 py-2 rounded-full bg-white text-black font-semibold shadow-soft"
              (click)="zoomIn()"
            >
              Zoom In
            </button>
            <button
              class="px-4 py-2 rounded-full bg-white text-black font-semibold shadow-soft"
              (click)="zoomOut()"
            >
              Zoom Out
            </button>
          </div>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 rounded-full bg-white text-black font-semibold shadow-soft"
              (click)="openConfirm()"
            >
              Like it
            </button>
            <button
              class="px-4 py-2 rounded-full bg-gradient-to-r from-accent to-accent-2 text-black font-semibold shadow-soft"
              (click)="goToRedesign()"
            >
              Redesign
            </button>
          </div>
        </div>

        <div
          *ngIf="showConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
        >
          <div class="w-full max-w-lg rounded-[24px] border border-white/10 bg-[#0f111a] p-6 sm:p-7 space-y-5 shadow-strong">
            <div class="text-lg font-semibold">Confirm Order</div>
            <p class="text-sm text-text-muted">
              Please add the following data. Thank you for your order, we will contact you.
            </p>
            <div class="space-y-4">
              <div class="space-y-1">
                <cre8-select
                  label="Size"
                  [options]="sizeOptions"
                  [placeholder]="'Choose size'"
                  [(ngModel)]="selectedSize"
                />
              </div>
              <div class="space-y-1">
                <cre8-select
                  label="Color"
                  [options]="colorOptions"
                  [placeholder]="'Choose color'"
                  [(ngModel)]="confirmColor"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs text-text-muted">Phone number</label>
                <input
                  type="tel"
                  [value]="phoneInput"
                  (input)="phoneInput = $any($event.target).value"
                  class="w-full rounded-[12px] bg-white/10 border border-white/15 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button
                class="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-semibold shadow-soft"
                (click)="closeConfirm()"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 rounded-full bg-gradient-to-r from-accent to-accent-2 text-black font-semibold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="confirming || !selectedSize || !confirmColor || !orderId"
                (click)="confirmOrder()"
              >
                {{ confirming ? 'Saving...' : 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <cre8-toast-container />
    <cre8-loader-overlay [active]="confirming" message="Saving your order..." />
  `,
})
export class DesignEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly designsEndpoint = `${environment.apiUrl}/api/orders`;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private canvas!: Canvas;
  public selectedProduct:  Product | null = null;
  private sideObjects: Record<'front' | 'back', FabricObject[]> = { front: [], back: [] };
  zoom = 1;
  currentView: 'front' | 'back' = 'front';
  designs: { id: string; imageUrl: string }[] = [];
  selectedDesignIndex = 0;
  selectedDesignModel: number | null = 0;
  orderId: string | null = null;
  textInput = 'Your text';
  fonts = ['Space Grotesk', 'Inter', 'Poppins', 'Roboto Mono'];
  selectedFont = this.fonts[0];
  selectedColor: string | null = '#ffffff'; // text/editor color
  confirmColor: string | null = 'white'; // confirm modal color
  sizeOptions: SelectOption[] = [
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
    { value: 'xl', label: 'XL' },
  ];
  colorOptions: SelectOption[] = [
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
  ];
  selectedSize: string | null = null;
  phoneInput = '';
  showConfirm = false;
  confirming = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly productsService: ProductService,
    private readonly ordersService: OrderService,
    private readonly toast: ToastService,
    private readonly exportService: DesignExportService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('productId');
      const orderId = params.get('orderId');
      this.orderId = orderId;
      if (productId) {
        this.productsService.getById(productId).subscribe({
          next: (product) => {
            this.selectedProduct = { ...product };
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            if (this.canvas) {
              this.setBackgroundForView();
            }
          },
        });
      }
      if (orderId) {
        this.fetchDesignsByOrder(orderId).then((designs) => {
          this.designs = designs.map((d) => ({ id: d.id, imageUrl: d.imageUrl || '' }));
          this.selectedDesignIndex = 0;
          this.selectedDesignModel = 0;
          this.renderDesign(this.designs[0]?.imageUrl || '' );
        });
      }
    });
  }

  ngAfterViewInit(): void {
    const targetHeight = 640;
    const parentWidth = this.canvasRef.nativeElement.parentElement?.clientWidth || 960;
    this.canvasRef.nativeElement.width = parentWidth;
    this.canvasRef.nativeElement.height = targetHeight;

    this.canvas = new Canvas(this.canvasRef.nativeElement, {
      backgroundColor: '#0b0d17',
      preserveObjectStacking: true,
      selection: true,
      width: parentWidth,
      height: targetHeight,
    });
    this.setBackgroundForView();
  }

  ngOnDestroy(): void {
    this.canvas?.dispose();
  }

  private async setBackgroundForView() {
    const url =
      this.currentView === 'front'
        ? this.selectedProduct?.frontImageUrl || ''
        : this.selectedProduct?.backImageUrl || '';

    await FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      const canvasWidth = this.canvas.getWidth() || 0;
      const canvasHeight = this.canvas.getHeight() || 0;
      img.scaleToWidth(canvasWidth * 0.6);
      img.set({ selectable: false, evented: false, opacity: 0.9, crossOrigin: 'anonymous' as any });
      this.canvas.set('backgroundImage', img);
      img.set({
        top: canvasHeight * 0.1,
        left: (canvasWidth - (img.getScaledWidth() || 0)) / 2,
      });
      this.canvas.requestRenderAll();
    });
  }


  private renderDesign(url: string) {
    if (!this.canvas) return;
    // Remove existing fabric images before adding the selected one
    this.canvas.getObjects().forEach((obj) => {
      if (obj instanceof FabricImage) {
        this.canvas.remove(obj);
      }
    });

    const safeUrl = url || '';
    FabricImage.fromURL(safeUrl, { crossOrigin: 'anonymous' }).then((img) => {
      img.scaleToWidth(240);
      img.set({
        top: 120,
        left: 140,
        cornerColor: '#b66bff',
        borderColor: '#b66bff',
        crossOrigin: 'anonymous' as any,
      });
      this.canvas.add(img);
      this.canvas.setActiveObject(img);
      this.canvas.requestRenderAll();
    });
  }

  private fetchDesignsByOrder(orderId: string) {
    return firstValueFrom(this.ordersService.getDesignsByOrder(orderId));
  }

  private loadSelectedProduct(): StoredProduct | null {
    const stored = localStorage.getItem('selectedProduct');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as StoredProduct;
    } catch {
      return null;
    }
  }

  selectDesign(index: number) {
    this.selectedDesignIndex = index;
    this.selectedDesignModel = index;
    const selected = this.designs[this.selectedDesignIndex];
    this.renderDesign(selected?.imageUrl || '' );
  }

  onDesignSelect(value: string | number | null) {
    const index = typeof value === 'number' ? value : Number(value);
    const safeIndex = isNaN(index) ? 0 : index;
    this.selectedDesignModel = safeIndex;
    this.selectDesign(safeIndex);
  }

  get designOptions(): SelectOption[] {
    return this.designs.map((_, i) => ({
      value: i,
      label: `Design ${i + 1}`,
    }));
  }

  get fontOptions(): SelectOption[] {
    return this.fonts.map((font) => ({ value: font, label: font }));
  }

  addText() {
    const text = new Textbox(this.textInput || 'Your text', {
      left: 180,
      top: 200,
      fontSize: 22,
      fill: this.selectedColor || '#ffffff',
      fontFamily: this.selectedFont,
      borderColor: '#53e9ff',
      cornerColor: '#53e9ff',
    });
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    this.canvas.renderAll();
  }

  rotateSelected() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.rotate((active.angle || 0) + 15);
    this.canvas.requestRenderAll();
  }

  deleteSelected() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    this.canvas.remove(active);
    this.canvas.requestRenderAll();
  }

  resetView() {
    this.canvas.clear();
    this.setBackgroundForView();
    this.canvas.requestRenderAll();
  }

  switchView(view: 'front' | 'back') {
    if (!this.canvas || this.currentView === view) return;
    // Keep current side objects in memory (no serialize/enliven)
    const currentObjects = this.getDrawableObjects();
    this.sideObjects[this.currentView] = currentObjects;
    currentObjects.forEach((obj) => this.canvas.remove(obj));

    this.currentView = view;
    this.setBackgroundForView();

    const nextObjects = this.sideObjects[view];
    nextObjects.forEach((obj) => this.canvas.add(obj));
    this.canvas.requestRenderAll();
  }

  zoomIn() {
    const nextZoom = Math.min(this.zoom + 0.1, 2);
    this.zoomToCanvasCenter(nextZoom);
  }

  zoomOut() {
    const nextZoom = Math.max(this.zoom - 0.1, 0.5);
    this.zoomToCanvasCenter(nextZoom);
  }

  private zoomToCanvasCenter(scale: number) {
    if (!this.canvas) return;
    const center = new Point(this.canvas.getWidth() / 2, this.canvas.getHeight() / 2);
    this.zoom = scale;
    this.canvas.zoomToPoint(center, this.zoom);
    this.canvas.requestRenderAll();
  }

  goToRedesign() {
    const target =  `/design/product/${this.selectedProduct?.id}` ;
    this.router.navigateByUrl(target);
  }

  private getDrawableObjects(): FabricObject[] {
    if (!this.canvas) return [];
    const bg = this.canvas.backgroundImage;
    return this.canvas.getObjects().filter((obj) => obj !== bg) as FabricObject[];
  }

  openConfirm() {
    this.showConfirm = true;
  }

  closeConfirm() {
    this.showConfirm = false;
  }

  private async captureSide(side: 'front' | 'back'): Promise<File | null> {
    if (!this.canvas) return null;
    const originalView = this.currentView;
    // sync current side objects
    this.sideObjects[this.currentView] = this.getDrawableObjects();

    if (originalView !== side) {
      this.sideObjects[this.currentView].forEach((obj) => this.canvas.remove(obj));
      this.currentView = side;
      await this.setBackgroundForView();
      this.sideObjects[side].forEach((obj) => this.canvas.add(obj));
    }

    this.canvas.requestRenderAll();
    await this.waitForRender();
    let file: File | null = null;
    try {
      const dataUrl = this.canvas.toDataURL({ format: 'png', multiplier: 1 });
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const emailSlug = this.exportService.getEmailSlug();
      file = new File([blob], `${emailSlug}-${side}.png`, { type: 'image/png' });
    } catch (_err) {
      // tainted canvas or export failed
      file = null;
    }

    if (originalView !== side) {
      // persist captured side objects and restore original view
      this.sideObjects[side] = this.getDrawableObjects();
      this.sideObjects[side].forEach((obj) => this.canvas.remove(obj));
      this.currentView = originalView;
      await this.setBackgroundForView();
      this.sideObjects[originalView].forEach((obj) => this.canvas.add(obj));
      this.canvas.requestRenderAll();
    }

    return file;
  }

  async confirmOrder() {
    if (!this.orderId) return;
    this.confirming = true;
    this.toast.show('Preparing order ...', 'info');
    try {
      // Make sure current side objects are cached
      this.sideObjects[this.currentView] = this.getDrawableObjects();

      const frontObjects = this.currentView === 'front' ? this.getDrawableObjects() : this.sideObjects['front'] || [];
      const backObjects = this.currentView === 'back' ? this.getDrawableObjects() : this.sideObjects['back'] || [];

      // Export individual assets for printing (texts and designs for both sides)
      const [frontTexts, backTexts, frontDesigns, backDesigns] = await Promise.all([
        this.exportService.exportObjects(frontObjects, 'front', 'text'),
        this.exportService.exportObjects(backObjects, 'back', 'text'),
        this.exportService.exportObjects(frontObjects, 'front', 'design'),
        this.exportService.exportObjects(backObjects, 'back', 'design'),
      ]);
      const downloadQueue = [...frontTexts, ...backTexts, ...frontDesigns, ...backDesigns];

      const frontFile = await this.captureSide('front');
      const backFile = await this.captureSide('back');
      if (frontFile) downloadQueue.push(frontFile);
      if (backFile) downloadQueue.push(backFile);
      await firstValueFrom(
    this.ordersService.confirm(this.orderId, {
      phoneNumber: this.phoneInput || undefined,
      size: this.selectedSize || undefined,
      color: this.confirmColor || undefined,
          frontSnapshot: frontFile || undefined,
          backSnapshot: backFile || undefined,
          designFiles: [...frontDesigns, ...backDesigns],
          textFiles: [...frontTexts, ...backTexts],
        }),
      );
      if (downloadQueue.length) {
        this.downloadFiles(downloadQueue);
      }
      this.toast.show('Order submitted! We will contact you soon.', 'success');
      this.router.navigateByUrl('/');
    } finally {
      this.confirming = false;
      this.showConfirm = false;
    }
  }

  private waitForRender(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  /**
   * Trigger downloads for a list of files (used for handoff to printing).
   */
  private downloadFiles(files: File[]) {
    this.exportService.downloadFiles(files);
  }
}
