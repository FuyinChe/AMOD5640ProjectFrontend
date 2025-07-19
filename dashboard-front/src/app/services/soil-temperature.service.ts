import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SoilTemperatureService {
  private baseUrl = environment.API_BASE_URL;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getSoilTemperatureData(
    startDate: string,
    endDate: string,
    depth: string = '5cm',
    groupBy: string = 'day'
  ): Observable<any> {
    // Check authentication before making request
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required to access soil temperature data');
    }
    
    const params = new HttpParams()
      .set('group_by', groupBy)
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('depth', depth);

    return this.http.get(`${this.baseUrl}/charts/soil-temperature/`, { params });
  }
} 