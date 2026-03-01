import { Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, VisaBulletin, DolProcessing, Prediction, VisaHistoryResponse } from '../../core/services/api.service';
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your Green Card journey</p>
        </div>
        <!-- Filters -->
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
          <div class="flex items-center text-xs text-gray-400 px-3 py-2 bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-700 rounded-lg">
            Last updated: {{ lastUpdated() ? (lastUpdated() | date:'MMM yyyy') : '—' }}
          </div>
        </div>
      </div>

      <!-- Error Banner -->
      <div *ngIf="error()" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
        <p class="font-medium text-sm">⚠ {{ error() }}</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <!-- Skeleton or Final Action Date -->
        <ng-container *ngIf="isLoading(); else cards">
          <div *ngFor="let i of [1,2,3,4]" class="dashboard-card animate-pulse">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-3"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </ng-container>

        <ng-template #cards>
          <!-- Final Action Date -->
          <div class="dashboard-card">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Final Action Date</p>
            <div class="mt-3">
              <span class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ visaData()?.is_current_final_action ? 'Current' : (visaData()?.final_action_date | date:'MMM d, y') || '—' }}
              </span>
            </div>
            <div class="mt-2 flex items-center gap-1 text-sm"
                 [class.text-green-500]="(visaData()?.movement_days || 0) > 0"
                 [class.text-red-500]="(visaData()?.movement_days || 0) < 0"
                 [class.text-gray-400]="!visaData()?.movement_days">
              <span *ngIf="visaData()?.movement_days">
                {{ (visaData()?.movement_days || 0) > 0 ? '▲' : '▼' }} {{ visaData()?.movement_days | number:'1.0-0' }} days this month
              </span>
              <span *ngIf="!visaData()?.movement_days">No movement data</span>
            </div>
          </div>

          <!-- Dates for Filing -->
          <div class="dashboard-card">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Dates for Filing</p>
            <div class="mt-3">
              <span class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ visaData()?.is_current_filing ? 'Current' : (visaData()?.filing_date | date:'MMM d, y') || '—' }}
              </span>
            </div>
            <div class="mt-2 text-sm text-gray-400">Bulletin: {{ visaData()?.bulletin_month ? (visaData()?.bulletin_month | date:'MMM yyyy') : '—' }}</div>
          </div>

          <!-- DOL PERM Analyst -->
          <div class="dashboard-card">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">DOL PERM Analyst</p>
            <div class="mt-3">
              <span class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ dolData()?.analyst_review_month ? (dolData()?.analyst_review_month | date:'MMM yyyy') : '—' }}
              </span>
            </div>
            <div class="mt-2 text-sm text-gray-400">
              Updated: {{ dolData()?.update_month ? (dolData()?.update_month | date:'MMM yyyy') : '—' }}
            </div>
          </div>

          <!-- Prediction -->
          <div class="dashboard-card border-l-4 border-l-primary">
            <p class="text-xs font-semibold uppercase tracking-wider text-primary">AI Prediction</p>
            <div class="mt-3">
              <span class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ predictionData()?.estimated_months_to_current != null ? (predictionData()?.estimated_months_to_current | number:'1.0-1') + ' mo' : '—' }}
              </span>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <span class="text-sm text-gray-400">to Current</span>
              <span *ngIf="predictionData()?.confidence_level"
                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class.bg-green-100]="predictionData()?.confidence_level === 'High'"
                    [class.text-green-700]="predictionData()?.confidence_level === 'High'"
                    [class.bg-yellow-100]="predictionData()?.confidence_level === 'Medium'"
                    [class.text-yellow-700]="predictionData()?.confidence_level === 'Medium'"
                    [class.bg-red-100]="predictionData()?.confidence_level === 'Low'"
                    [class.text-red-700]="predictionData()?.confidence_level === 'Low'">
                {{ predictionData()?.confidence_level }}
              </span>
            </div>
          </div>
        </ng-template>
      </div>

      <!-- Movement Chart -->
      <div class="dashboard-card">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Movement Intelligence</h3>
            <p class="text-sm text-gray-400 mt-0.5">Monthly final action date movement (days) — last 24 months</p>
          </div>
        </div>
        <div *ngIf="isLoading()" class="h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        <div *ngIf="!isLoading() && historyData().length === 0" class="h-64 flex items-center justify-center text-gray-400 text-sm">
          No history data available for {{ category }} / {{ country }}
        </div>
        <canvas #chartCanvas *ngIf="!isLoading() && historyData().length > 0" class="max-h-64"></canvas>
      </div>

      <!-- Disclaimer -->
      <footer class="text-xs text-center text-gray-400 py-4 border-t border-gray-200 dark:border-gray-800">
        Not affiliated with USCIS, DOL, or the U.S. Department of State. Data sourced from publicly available government websites.
      </footer>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private api = inject(ApiService);
  private chart: Chart | null = null;

  category = 'EB2';
  country = 'India';

  isLoading = signal(true);
  error = signal<string | null>(null);
  visaData = signal<VisaBulletin | null>(null);
  dolData = signal<DolProcessing | null>(null);
  predictionData = signal<Prediction | null>(null);
  historyData = signal<VisaBulletin[]>([]);
  lastUpdated = signal<string | null>(null);
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

  ngOnDestroy() {
    this.chart?.destroy();
  }

  onFilterChange() {
    this.chart?.destroy();
    this.chart = null;
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    let completed = 0;
    const done = () => { if (++completed === 4) this.isLoading.set(false); };

    this.api.getVisaCurrent().subscribe({
      next: (data) => {
        const match = data.find(d => d.category === this.category && d.country === this.country);
        this.visaData.set(match ?? null);
        if (match) this.lastUpdated.set(match.bulletin_month);
        done();
      },
      error: (e) => { this.error.set('Could not load visa data: ' + e.message); done(); }
    });

    this.api.getDolCurrent().subscribe({
      next: (data) => { this.dolData.set(data); done(); },
      error: () => done()
    });

    this.api.getVisaPredictions().subscribe({
      next: (data) => {
        const match = data.find(d => d.category === this.category && d.country === this.country);
        this.predictionData.set(match ?? null);
        done();
      },
      error: () => done()
    });

    this.api.getVisaHistory(this.category, this.country, 1, 24).subscribe({
      next: (response) => {
        this.historyData.set([...(response.data || [])].reverse());
        done();
        if (this.viewReady) {
          setTimeout(() => this.renderChart(), 50);
        }
      },
      error: () => done()
    });
  }

  private renderChart() {
    if (!this.chartCanvas?.nativeElement) return;
    this.chart?.destroy();

    const data = this.historyData();
    const labels = data.map(d => {
      const dt = new Date(d.bulletin_month);
      return dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    const values = data.map(d => d.movement_days ?? 0);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Movement (days)',
          data: values,
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37,99,235,0.08)',
          borderWidth: 2,
          pointBackgroundColor: values.map(v => v < 0 ? '#DC2626' : '#2563EB'),
          pointRadius: 4,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => { const v = ctx.parsed.y ?? 0; return `${v > 0 ? '+' : ''}${v} days`; }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
          y: { grid: { color: 'rgba(156,163,175,0.1)' }, ticks: { color: '#9CA3AF', font: { size: 11 } } }
        }
      }
    });
  }
}
