import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RainfallService {
  private baseUrl = environment.API_BASE_URL;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getHourlyRainfallData(startDate: string, endDate: string, groupBy: string = 'hour'): Observable<any> {
    // Check authentication before making request
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required to access rainfall data');
    }
    
    const params = new HttpParams()
      .set('group_by', groupBy)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get(`${this.baseUrl}/charts/rainfall/`, { params });
  }
} 