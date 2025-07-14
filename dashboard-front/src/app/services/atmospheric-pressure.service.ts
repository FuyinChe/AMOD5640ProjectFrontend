import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface AtmosphericPressureRecord {
  period: string;
  avg: number;
  max: number;
  min: number;
}

export interface AtmosphericPressureResponse {
  success: boolean;
  data: AtmosphericPressureRecord[];
  unit: string;
}

@Injectable({
  providedIn: 'root'
})
export class AtmosphericPressureService {
  private baseUrl = environment.API_BASE_URL;

  constructor(private http: HttpClient) {}

  getAtmosphericPressureData(
    startDate: string,
    endDate: string,
    groupBy: string = 'hour'
  ): Observable<AtmosphericPressureResponse> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('group_by', groupBy);

    return this.http.get<AtmosphericPressureResponse>(`${this.baseUrl}/charts/atmospheric-pressure/`, { params });
  }
} 