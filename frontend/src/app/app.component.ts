import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `
    <div class="min-h-screen flex flex-col md:flex-row">
      <!-- Sidebar -->
      <aside class="w-full md:w-64 bg-white dark:bg-cardDark border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col shrink-0">
        <div class="mb-8">
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">GreenCard Insights</h1>
          <p class="text-xs text-gray-400 mt-1">ImmigraTrack</p>
        </div>
        <nav class="space-y-1 flex-grow">
          <a routerLink="/dashboard" routerLinkActive="bg-primary/10 !text-primary font-medium"
             class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>
          <a routerLink="/visa-bulletin" routerLinkActive="bg-primary/10 !text-primary font-medium"
             class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Visa Bulletin
          </a>
          <a routerLink="/perm-timeline" routerLinkActive="bg-primary/10 !text-primary font-medium"
             class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            PERM Timeline
          </a>
        </nav>

        <!-- Theme Toggle -->
        <div class="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
          <button (click)="toggleTheme()" class="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span class="flex items-center gap-2">
              <svg *ngIf="isDarkMode()" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg *ngIf="!isDarkMode()" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Theme
            </span>
            <span class="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{{ isDarkMode() ? 'Dark' : 'Light' }}</span>
          </button>
        </div>
      </aside>

      <!-- Page Content via Router -->
      <main class="flex-1 overflow-auto min-h-screen bg-gray-50 dark:bg-bgDark">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {
  isDarkMode = signal(true);

  toggleTheme() {
    this.isDarkMode.update(c => !c);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
