import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface WindSpeedRecord {
  period: string;
  avg: number;
  max: number;
  min: number;
}

export interface WindSpeedResponse {
  success: boolean;
  data: WindSpeedRecord[];
  unit: string;
}

@Injectable({
  providedIn: 'root'
})
export class WindSpeedService {
  private baseUrl = environment.API_BASE_URL;

  constructor(private http: HttpClient) {}

  getWindSpeedData(
    startDate: string,
    endDate: string,
    groupBy: string = 'hour'
  ): Observable<WindSpeedResponse> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('group_by', groupBy);

    return this.http.get<WindSpeedResponse>(`${this.baseUrl}/charts/wind-speed/`, { params });
  }
} 