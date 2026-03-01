import { Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService, DolProcessing } from '../../core/services/api.service';
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-perm-timeline',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">

      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">PERM Timeline</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">DOL PERM processing months — current status and historical trends</p>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 text-sm">
        ⚠ {{ error() }}
      </div>

      <!-- Current Status Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ng-container *ngIf="isLoading()">
          <div *ngFor="let i of [1,2,3]" class="dashboard-card animate-pulse">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          </div>
        </ng-container>

        <ng-container *ngIf="!isLoading()">
          <div class="dashboard-card">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Analyst Review Month</p>
            <p class="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {{ currentDol()?.analyst_review_month ? (currentDol()?.analyst_review_month | date:'MMM yyyy') : '—' }}
            </p>
            <p class="mt-2 text-xs text-gray-400">Cases being reviewed/decided now</p>
          </div>

          <div class="dashboard-card">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Audit Review Month</p>
            <p class="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {{ currentDol()?.audit_review_month ? (currentDol()?.audit_review_month | date:'MMM yyyy') : '—' }}
            </p>
            <p class="mt-2 text-xs text-gray-400">Cases selected for audit review</p>
          </div>

          <div class="dashboard-card">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">PWD Month</p>
            <p class="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {{ currentDol()?.pwd_month ? (currentDol()?.pwd_month | date:'MMM yyyy') : '—' }}
            </p>
            <p class="mt-2 text-xs text-gray-400">Prevailing wage determinations</p>
          </div>
        </ng-container>
      </div>

      <!-- What is PERM? -->
      <div class="dashboard-card bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-2">📋 How to Read PERM Processing Dates</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <p class="font-medium text-gray-800 dark:text-gray-200 mb-1">Analyst Review</p>
            <p>The filing month currently under initial review by a DOL analyst. If your filing month is ≤ this date, your case is likely being reviewed.</p>
          </div>
          <div>
            <p class="font-medium text-gray-800 dark:text-gray-200 mb-1">Audit Review</p>
            <p>The filing month of cases currently under DOL audit. Audits add ~6 months to processing time.</p>
          </div>
          <div>
            <p class="font-medium text-gray-800 dark:text-gray-200 mb-1">PWD</p>
            <p>Prevailing Wage Determination month — requests from this period are being processed by the National Prevailing Wage Center (NPWC).</p>
          </div>
        </div>
      </div>

      <!-- Historical Chart -->
      <div class="dashboard-card">
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 dark:text-white">Processing Month Trends</h3>
          <p class="text-sm text-gray-400 mt-0.5">Analyst review months over time (how many months back DOL was working)</p>
        </div>
        <div *ngIf="isLoading()" class="h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        <div *ngIf="!isLoading() && historyData().length === 0"
             class="h-64 flex items-center justify-center text-gray-400 text-sm">
          No historical DOL data available
        </div>
        <canvas #chartCanvas *ngIf="!isLoading() && historyData().length > 0" class="max-h-64"></canvas>
      </div>

      <!-- History Table -->
      <div class="dashboard-card p-0 overflow-hidden" *ngIf="!isLoading() && historyData().length > 0">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-white">Historical Records</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Update Month</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Analyst Review</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Audit Review</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PWD Month</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let row of historyData()" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-3 font-medium text-gray-900 dark:text-white">{{ row.update_month | date:'MMM yyyy' }}</td>
                <td class="px-6 py-3 text-gray-600 dark:text-gray-300">{{ row.analyst_review_month | date:'MMM yyyy' }}</td>
                <td class="px-6 py-3 text-gray-600 dark:text-gray-300">{{ row.audit_review_month | date:'MMM yyyy' }}</td>
                <td class="px-6 py-3 text-gray-600 dark:text-gray-300">{{ row.pwd_month | date:'MMM yyyy' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Disclaimer -->
      <footer class="text-xs text-center text-gray-400 py-4 border-t border-gray-200 dark:border-gray-800">
        Not affiliated with USCIS, DOL, or the U.S. Department of State.
      </footer>
    </div>
  `
})
export class PermTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private api = inject(ApiService);
  private chart: Chart | null = null;

  isLoading = signal(true);
  error = signal<string | null>(null);
  currentDol = signal<DolProcessing | null>(null);
  historyData = signal<DolProcessing[]>([]);
  private viewReady = false;

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (!this.isLoading() && this.historyData().length > 0) {
      this.renderChart();
    }
  }

  ngOnDestroy() { this.chart?.destroy(); }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    let done = 0;
    const check = () => { if (++done === 2) this.isLoading.set(false); };

    this.api.getDolCurrent().subscribe({
      next: (data) => { this.currentDol.set(data); check(); },
      error: (e) => { this.error.set('Could not load DOL data: ' + e.message); check(); }
    });

    this.api.getDolHistory().subscribe({
      next: (data) => {
        const sorted = [...data].sort((a, b) =>
          new Date(a.update_month).getTime() - new Date(b.update_month).getTime()
        );
        this.historyData.set(sorted);
        check();
        if (this.viewReady) setTimeout(() => this.renderChart(), 50);
      },
      error: () => check()
    });
  }

  private renderChart() {
    if (!this.chartCanvas?.nativeElement) return;
    this.chart?.destroy();

    const data = this.historyData();
    const labels = data.map(d => {
      const dt = new Date(d.update_month);
      return dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });

    // Calculate how many months back the analyst date was from the update date
    const lag = data.map(d => {
      const update = new Date(d.update_month);
      const analyst = new Date(d.analyst_review_month);
      return Math.round((update.getTime() - analyst.getTime()) / (1000 * 60 * 60 * 24 * 30));
    });

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Processing Lag (months)',
          data: lag,
          backgroundColor: lag.map(v => v > 18 ? 'rgba(220,38,38,0.6)' : v > 12 ? 'rgba(245,158,11,0.6)' : 'rgba(37,99,235,0.6)'),
          borderColor: lag.map(v => v > 18 ? '#DC2626' : v > 12 ? '#F59E0B' : '#2563EB'),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `~${ctx.parsed.y} months behind`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
          y: {
            grid: { color: 'rgba(156,163,175,0.1)' },
            ticks: { color: '#9CA3AF', font: { size: 11 } },
            title: { display: true, text: 'Months of lag', color: '#9CA3AF', font: { size: 11 } }
          }
        }
      }
    });
  }
}
