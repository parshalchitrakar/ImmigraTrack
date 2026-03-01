import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface VisaBulletin {
  id: string;
  category: string;
  country: string;
  final_action_date: string | null;
  is_current_final_action: boolean;
  filing_date: string | null;
  is_current_filing: boolean;
  bulletin_month: string;
  movement_days: number | null;
  created_at: string;
}

export interface DolProcessing {
  id: string;
  analyst_review_month: string;
  audit_review_month: string;
  pwd_month: string;
  update_month: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  category: string;
  country: string;
  avg_monthly_movement_days: number | null;
  regression_slope: number | null;
  confidence_level: string | null;
  estimated_months_to_current: number | null;
  last_calculated_at: string;
}

export interface AnalyticsMetrics {
  category: string;
  country: string;
  total_months: number;
  avg_movement: number;
  max_movement: number;
  min_movement: number;
  retrogressions: number;
  months_current: number;
}

export interface VisaHistoryResponse {
  data: VisaBulletin[];
  limit: number;
  totalPages: number;
}

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  getVisaCurrent(): Observable<VisaBulletin[]> {
    return this.http.get<VisaBulletin[]>(`${this.baseUrl}/visa/current`);
  }

  getVisaHistory(category: string, country: string, page = 1, limit = 12): Observable<VisaHistoryResponse> {
    const params = new HttpParams()
      .set('category', category)
      .set('country', country)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<VisaHistoryResponse>(`${this.baseUrl}/visa/history`, { params });
  }

  getVisaPredictions(): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.baseUrl}/visa/prediction`);
  }

  getDolCurrent(): Observable<DolProcessing> {
    return this.http.get<DolProcessing>(`${this.baseUrl}/dol/current`);
  }

  getDolHistory(): Observable<DolProcessing[]> {
    return this.http.get<DolProcessing[]>(`${this.baseUrl}/dol/history`);
  }

  getAnalyticsMetrics(category: string, country: string): Observable<AnalyticsMetrics> {
    const params = new HttpParams().set('category', category).set('country', country);
    return this.http.get<AnalyticsMetrics>(`${this.baseUrl}/analytics/metrics`, { params });
  }
}
