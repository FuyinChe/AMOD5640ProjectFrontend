import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface CorrelationMatrix {
  correlation_matrix: number[][];
  p_value_matrix: number[][];
  metric_names: string[];
  pairwise_correlations: PairwiseCorrelation[];
  statistics: CorrelationStatistics;
}

export interface PairwiseCorrelation {
  metric1: string;
  metric2: string;
  correlation: number;
  p_value: number;
  sample_size: number;
}

export interface CorrelationStatistics {
  total_records: number;
  valid_pairs: number;
  strong_correlations: number;
  moderate_correlations: number;
  weak_correlations: number;
}

export interface CorrelationResponse {
  success: boolean;
  data: CorrelationMatrix;
  metadata: {
    start_date: string;
    end_date: string;
    metrics: string[];
    correlation_method: string;
    include_p_values: boolean;
    sample_size: number;
    depth?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CorrelationAnalysisService {
  private apiUrl = environment.API_BASE_URL;

  constructor(private http: HttpClient) { }

  getCorrelationAnalysis(
    startDate?: string,
    endDate?: string,
    metrics?: string[],
    correlationMethod: 'pearson' | 'spearman' = 'pearson'
  ): Observable<CorrelationResponse> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }
    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => {
        params = params.append('metrics', metric);
      });
    }
    if (correlationMethod) {
      params = params.set('correlation_method', correlationMethod);
    }

    return this.http.get<CorrelationResponse>(`${this.apiUrl}/charts/statistical/correlation/`, { params });
  }

  getDefaultCorrelationAnalysis(): Observable<CorrelationResponse> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 days ago
    
    return this.getCorrelationAnalysis(startDate, endDate);
  }
} 