import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'cre8-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section
      class="rounded-[32px] border border-accent/60 bg-surface/80 backdrop-blur-xl shadow-strong p-6 sm:p-10"
    >
      <div class="text-center space-y-2">
        <div class="text-3xl sm:text-4xl font-bold tracking-tight">Login</div>
        <p class="text-text-muted max-w-xl mx-auto">
          Continue your CRE8 journey. Secure email + password sign-in with validation and smooth
          navigation to product selection.
        </p>
      </div>

      <form class="mt-8 grid gap-5" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-2">
          <label class="font-semibold text-sm" for="email">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="you@example.com"
            autocomplete="email"
          />
          <div class="text-rose-200 text-sm" *ngIf="email.invalid && (email.dirty || email.touched)">
            <div *ngIf="email.errors?.['required']">Email is required.</div>
            <div *ngIf="email.errors?.['email']">Enter a valid email address.</div>
          </div>
        </div>

        <div class="grid gap-2">
          <label class="font-semibold text-sm" for="password">Password</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <div
            class="text-rose-200 text-sm"
            *ngIf="password.invalid && (password.dirty || password.touched)"
          >
            <div *ngIf="password.errors?.['required']">Password is required.</div>
            <div *ngIf="password.errors?.['minlength']">At least 8 characters.</div>
          </div>
        </div>

        <div class="grid gap-3">
          <button
            type="submit"
            [disabled]="form.invalid || submitting"
            class="rounded-full bg-gradient-to-r from-accent to-accent-2 text-black font-semibold px-6 py-3 shadow-soft transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Signing in…' : 'Sign In' }}
          </button>
          <div class="text-center text-text-muted text-sm">
            Need an account?
            <a routerLink="/register" class="text-white font-semibold underline">Create one</a>
          </div>
        </div>
      </form>
    </section>
  `,
})
export class LoginComponent {
  submitting = false;
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => (this.submitting = false),
      error: () => (this.submitting = false),
    });
  }
}
