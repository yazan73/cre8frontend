import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'cre8-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink, ToastContainerComponent],
  template: `
    <section
      class="rounded-[32px] border border-accent/60 bg-surface/80 backdrop-blur-xl shadow-strong overflow-hidden"
    >
      <div class="relative isolate">
        <div
          class="aspect-[16/9] w-full bg-gradient-to-r from-[#0b0d17] via-[#140a26] to-[#0a1020]"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/65"></div>

        <div class="absolute inset-0 flex items-center justify-center text-center px-6 py-10">
          <div class="space-y-4 max-w-2xl">
            <div class="text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-lg">
              CRE<span class="text-accent">8</span>
            </div>
            <div class="text-lg sm:text-2xl font-semibold">
              Custom. Connected. Created by You.
            </div>
            <p class="text-text-muted max-w-xl mx-auto">
              Design hoodies and tees with AI or your own art, then customize every detail in our
              interactive editor.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                (click)="onStart()"
                class="px-6 py-3 rounded-full bg-white text-black font-semibold shadow-soft hover:-translate-y-0.5 transition transform"
              >
                Start Your Journey
              </button>
              <a
                *ngIf="!isLoggedIn"
                routerLink="/register"
                class="px-6 py-3 rounded-full bg-gradient-to-r from-accent to-accent-2 text-black font-semibold shadow-soft hover:-translate-y-0.5 transition transform"
              >
                Create Account
              </a>
              <button
                *ngIf="isLoggedIn"
                type="button"
                class="px-6 py-3 rounded-full bg-white/10 text-white font-semibold border border-white/20 shadow-soft hover:-translate-y-0.5 transition transform"
                (click)="logout()"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 p-6 sm:grid-cols-[1.2fr_1fr]">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10">
            <span class="h-2 w-2 rounded-full bg-accent"></span>
            <span class="text-sm font-semibold">Powered by AI</span>
          </div>
          <h2 class="text-2xl font-semibold">Welcome to the CRE8 Studio</h2>
          <p class="text-text-muted">
            Craft designs with prompts, upload your own art, and see it instantly on premium
            apparel. Seamless editing, responsive previews, and secure checkout built in.
          </p>
          <div class="flex flex-wrap gap-3">
            <span class="badge">AI Design</span>
            <span class="badge">Uploads</span>
            <span class="badge">3D Preview</span>
            <span class="badge">Secure Checkout</span>
          </div>
        </div>

        <div class="grid gap-3">
          <div class="rounded-[22px] bg-white/5 border border-white/10 p-4 shadow-soft">
            <div class="text-sm text-text-muted">Step 1</div>
            <div class="font-semibold">Login or create an account</div>
          </div>
          <div class="rounded-[22px] bg-white/5 border border-white/10 p-4 shadow-soft">
            <div class="text-sm text-text-muted">Step 2</div>
            <div class="font-semibold">Pick hoodie or tee, then design with AI or upload</div>
          </div>
          <div class="rounded-[22px] bg-white/5 border border-white/10 p-4 shadow-soft">
            <div class="text-sm text-text-muted">Step 3</div>
            <div class="font-semibold">Edit in 3D, finalize, and place your order</div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class WelcomeComponent {
  isLoggedIn = !!localStorage.getItem('accessToken');

  constructor(private router: Router, private toast: ToastService) {}

  onStart() {
    if (this.isLoggedIn) {
      this.router.navigateByUrl('/product-selection');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    this.isLoggedIn = false;
    this.toast.show('Logged out', 'info');
    this.router.navigateByUrl('/login');
  }
}
