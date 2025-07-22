import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private apiUrl = `${environment.API_BASE_URL}/download/environmental-data/`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  downloadEnvironmentalData(
    startDate: string = '2023-01-01',
    endDate: string = '2023-12-31',
    fields?: string[]
  ): Observable<any[]> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    if (fields && fields.length > 0) {
      params = params.set('fields', fields.join(','));
    }
    return this.http.get<any[]>(this.apiUrl, { headers, params });
  }
} 