import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
  percentage?: number;
}

export interface HistogramStatistics {
  mean: number;
  median: number;
  std_dev: number;
  min: number;
  max: number;
  total_count: number;
}

export interface HistogramMetricData {
  bins: HistogramBin[];
  statistics: HistogramStatistics;
}

export interface HistogramApiResponse {
  success: boolean;
  data: {
    [metric: string]: HistogramMetricData;
  };
  metadata: any;
}

@Injectable({ providedIn: 'root' })
export class StatisticalHistogramService {
  private apiUrl = `${environment.API_BASE_URL}/charts/statistical/histogram/`;

  constructor(private http: HttpClient) {}

  getHistogramData(
    startDate: string,
    endDate: string,
    metrics?: string[],
    bins: number = 20,
    depth: string = '5cm'
  ): Observable<HistogramApiResponse> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('bins', bins.toString());
    if (metrics && metrics.length > 0) {
      metrics.forEach(m => {
        params = params.append('metrics', m);
      });
    }
    if (depth) {
      params = params.set('depth', depth);
    }
    return this.http.get<HistogramApiResponse>(this.apiUrl, { params });
  }
} 