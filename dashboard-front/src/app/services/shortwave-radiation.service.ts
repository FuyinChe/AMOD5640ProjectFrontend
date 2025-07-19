import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from './auth.service';

export interface ShortwaveRadiationRecord {
  period: string;
  avg: number;
  max: number;
  min: number;
}

export interface ShortwaveRadiationResponse {
  success: boolean;
  data: ShortwaveRadiationRecord[];
  unit: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShortwaveRadiationService {
  private baseUrl = environment.API_BASE_URL;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getShortwaveRadiationData(
    startDate: string,
    endDate: string,
    groupBy: string = 'hour'
  ): Observable<ShortwaveRadiationResponse> {
    // Check authentication before making request
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required to access shortwave radiation data');
    }
    
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('group_by', groupBy);

    return this.http.get<ShortwaveRadiationResponse>(`${this.baseUrl}/charts/shortwave-radiation/`, { params });
  }
} 