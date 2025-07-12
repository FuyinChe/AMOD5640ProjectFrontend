import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BoxplotStatistics {
  min: number | null;
  q1: number | null;
  median: number | null;
  q3: number | null;
  max: number | null;
  outliers: number[];
  count: number;
}

export interface BoxplotPeriodData {
  period: string;
  period_code: string | number;
  statistics: BoxplotStatistics;
}

export interface BoxplotApiResponse {
  success: boolean;
  data: {
    [metric: string]: BoxplotPeriodData[];
  };
  metadata: any;
}

@Injectable({ providedIn: 'root' })
export class StatisticalBoxplotService {
  private apiUrl = `${environment.API_BASE_URL}/charts/statistical/boxplot/`;

  constructor(private http: HttpClient) {}

  getBoxplotData(
    startDate: string,
    endDate: string,
    metrics?: string[],
    includeOutliers: boolean = true,
    depth: string = '5cm'
  ): Observable<BoxplotApiResponse> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('include_outliers', includeOutliers.toString());
    if (metrics && metrics.length > 0) {
      metrics.forEach(m => {
        params = params.append('metrics', m);
      });
    }
    if (depth) {
      params = params.set('depth', depth);
    }
    return this.http.get<BoxplotApiResponse>(this.apiUrl, { params });
  }
} 