import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SnowDepthService {
  private baseUrl = environment.API_BASE_URL;

  constructor(private http: HttpClient) {}

  getSnowDepthData(startDate: string, endDate: string, groupBy: string = 'day'): Observable<any> {
    const params = new HttpParams()
      .set('group_by', groupBy)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get(`${this.baseUrl}/charts/snow-depth/`, { params });
  }
} 