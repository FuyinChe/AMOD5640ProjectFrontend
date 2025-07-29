import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';

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
      return throwError(() => new Error('Authentication required to access rainfall data'));
    }
    
    const params = new HttpParams()
      .set('group_by', groupBy)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get(`${this.baseUrl}/charts/rainfall/`, { params });
  }

  getRainfallDataByYear(year: string, groupBy: string = 'year'): Observable<any> {
    // Check authentication before making request
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('Authentication required to access rainfall data'));
    }
    
    const params = new HttpParams()
      .set('group_by', groupBy);

    const url = `${this.baseUrl}/charts/rainfall/`;
    console.log('Making API request to:', url);
    console.log('With params:', params.toString());
    console.log('User token exists:', !!this.authService.getToken());

    return this.http.get(url, { params }).pipe(
      catchError((error) => {
        console.error('Rainfall API Error Details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }
} 