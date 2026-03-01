import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, VisaBulletin, Prediction, VisaHistoryResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-visa-bulletin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Visa Bulletin History</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly final action and filing dates</p>
        </div>
        <div class="flex gap-3 flex-wrap">
          <select [(ngModel)]="category" (ngModelChange)="onFilterChange()"
              class="bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="EB1">EB-1</option>
            <option value="EB2">EB-2</option>
            <option value="EB3">EB-3</option>
          </select>
          <select [(ngModel)]="country" (ngModelChange)="onFilterChange()"
              class="bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="India">India</option>
            <option value="China">China</option>
            <option value="ROW">Rest of World</option>
          </select>
        </div>
      </div>

      <!-- Prediction Card -->
      <div *ngIf="!isLoading() && predictionData()" class="dashboard-card border-l-4 border-l-primary flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex-1">
          <p class="text-xs font-semibold uppercase tracking-wider text-primary">AI Prediction for {{ category }} / {{ country }}</p>
          <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">
            ~{{ predictionData()?.estimated_months_to_current | number:'1.0-1' }} months to Current
          </p>
          <p class="text-sm text-gray-400 mt-0.5">
            Avg movement: {{ predictionData()?.avg_monthly_movement_days | number:'1.0-0' }} days/mo &nbsp;·&nbsp;
            Trend slope: {{ predictionData()?.regression_slope | number:'1.0-2' }}
          </p>
        </div>
        <span class="text-sm font-semibold px-3 py-1.5 rounded-full self-start sm:self-auto"
              [class.bg-green-100]="predictionData()?.confidence_level === 'High'"
              [class.text-green-700]="predictionData()?.confidence_level === 'High'"
              [class.bg-yellow-100]="predictionData()?.confidence_level === 'Medium'"
              [class.text-yellow-700]="predictionData()?.confidence_level === 'Medium'"
              [class.bg-red-100]="predictionData()?.confidence_level === 'Low'"
              [class.text-red-700]="predictionData()?.confidence_level === 'Low'"
              [class.bg-gray-100]="!predictionData()?.confidence_level">
          {{ predictionData()?.confidence_level || 'N/A' }} Confidence
        </span>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 text-sm">
        ⚠ {{ error() }}
      </div>

      <!-- Table -->
      <div class="dashboard-card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bulletin Month</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Final Action Date</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Filing Date</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Movement</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <!-- Skeleton -->
              <ng-container *ngIf="isLoading()">
                <tr *ngFor="let i of [1,2,3,4,5,6,7,8]" class="animate-pulse">
                  <td class="px-6 py-4"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                  <td class="px-6 py-4"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div></td>
                  <td class="px-6 py-4"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div></td>
                  <td class="px-6 py-4"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                </tr>
              </ng-container>

              <!-- Data Rows -->
              <ng-container *ngIf="!isLoading()">
                <tr *ngIf="historyData().length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-gray-400">No data available for {{ category }} / {{ country }}</td>
                </tr>
                <tr *ngFor="let row of historyData()" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ row.bulletin_month | date:'MMM yyyy' }}</td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <span *ngIf="row.is_current_final_action" class="text-green-600 font-semibold">Current</span>
                    <span *ngIf="!row.is_current_final_action">{{ row.final_action_date ? (row.final_action_date | date:'MMM d, y') : '—' }}</span>
                  </td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <span *ngIf="row.is_current_filing" class="text-green-600 font-semibold">Current</span>
                    <span *ngIf="!row.is_current_filing">{{ row.filing_date ? (row.filing_date | date:'MMM d, y') : '—' }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span *ngIf="row.movement_days != null"
                          class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                          [class.bg-green-100]="row.movement_days > 0"
                          [class.text-green-700]="row.movement_days > 0"
                          [class.bg-red-100]="row.movement_days < 0"
                          [class.text-red-700]="row.movement_days < 0"
                          [class.bg-gray-100]="row.movement_days === 0"
                          [class.text-gray-600]="row.movement_days === 0">
                      {{ row.movement_days > 0 ? '▲' : (row.movement_days < 0 ? '▼' : '–') }}
                      {{ row.movement_days | number:'1.0-0' }} days
                    </span>
                    <span *ngIf="row.movement_days == null" class="text-gray-400 text-xs">—</span>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="!isLoading() && historyData().length > 0" class="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span class="text-sm text-gray-500">Page {{ currentPage() }} · Showing {{ historyData().length }} records</span>
          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="currentPage() === 1"
                class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              ← Prev
            </button>
            <button (click)="nextPage()" [disabled]="historyData().length < pageSize"
                class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <footer class="text-xs text-center text-gray-400 py-4 border-t border-gray-200 dark:border-gray-800">
        Not affiliated with USCIS, DOL, or the U.S. Department of State.
      </footer>
    </div>
  `
})
export class VisaBulletinComponent implements OnInit {
  private api = inject(ApiService);

  category = 'EB2';
  country = 'India';
  currentPage = signal(1);
  pageSize = 12;

  isLoading = signal(true);
  error = signal<string | null>(null);
  historyData = signal<VisaBulletin[]>([]);
  predictionData = signal<Prediction | null>(null);
  totalPages = signal(1);

  ngOnInit() {
    this.loadData();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    let done = 0;
    const check = () => { if (++done === 2) this.isLoading.set(false); };

    this.api.getVisaHistory(this.category, this.country, this.currentPage(), this.pageSize).subscribe({
      next: (response) => { 
        this.historyData.set([...(response.data || [])].reverse());
        this.totalPages.set(response.totalPages || 1);
        check(); 
      },
      error: (e) => { this.error.set('Could not load history: ' + e.message); check(); }
    });

    this.api.getVisaPredictions().subscribe({
      next: (data) => {
        const match = data.find(d => d.category === this.category && d.country === this.country);
        this.predictionData.set(match ?? null);
        check();
      },
      error: () => check()
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadData();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadData();
    }
  }
}
