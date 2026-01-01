import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'cre8-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="grid gap-2 min-w-0">
      <label class="font-semibold text-sm" *ngIf="label">{{ label }}</label>
      <div
        class="relative rounded-[18px] border border-white/10 bg-white/5 focus-within:ring-2 focus-within:ring-accent transition select-wrapper"
      >
        <button
          type="button"
          class="w-full min-w-0 block text-left appearance-none bg-transparent px-4 py-3 pr-10 text-white focus:outline-none text-base sm:text-[15px]"
          [class.opacity-60]="disabled"
          (click)="toggleOpen()"
          [disabled]="disabled"
        >
          {{ displayLabel || placeholder || 'Select option' }}
        </button>
        <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/70">⌄</span>
        <div
          *ngIf="open"
          class="absolute left-0 mt-1 w-full max-h-60 overflow-auto rounded-[14px] border border-white/10 bg-[#0b0d17] shadow-xl z-20"
        >
          <button
            type="button"
            class="w-full text-left px-4 py-2 text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none"
            (click)="selectOption(null)"
            [class.font-semibold]="value === null"
          >
            {{ placeholder || 'Select option' }}
          </button>
          <ng-container *ngFor="let option of options">
            <button
              type="button"
              class="w-full text-left px-4 py-2 text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none"
              (click)="selectOption(option.value)"
              [class.font-semibold]="option.value === value"
            >
              {{ option.label }}
            </button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }
      :host .select-wrapper {
        width: 100%;
        position: relative;
      }
      @media (max-width: 640px) {
        :host .select-wrapper {
          border-radius: 16px;
        }
        :host button {
          font-size: 0.9rem;
          padding-left: 0.9rem;
          padding-right: 2.5rem;
          padding-top: 0.65rem;
          padding-bottom: 0.65rem;
        }
      }
    `,
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() options: SelectOption[] = [];
  @Output() changed = new EventEmitter<string | number | null>();

  value: string | number | null = null;
  disabled = false;
  open = false;
  displayLabel = '';

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open = false;
    }
  }

  toggleOpen() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  selectOption(val: string | number | null) {
    this.onSelect(val);
    this.open = false;
    this.updateDisplayLabel();
  }

  onSelect(val: string | number | null) {
    this.value = val;
    this.onChange(val);
    this.onTouched();
    this.changed.emit(val);
  }

  writeValue(val: string | number | null): void {
    this.value = val ?? null;
    this.updateDisplayLabel();
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private updateDisplayLabel() {
    const match = this.options.find((o) => o.value === this.value);
    this.displayLabel = match?.label || this.placeholder || 'Select option';
  }
}
