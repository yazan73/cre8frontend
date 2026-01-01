import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'cre8-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-cre8-bg text-white flex items-center justify-center p-6">
      <div class="w-full max-w-6xl">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AppComponent {}
