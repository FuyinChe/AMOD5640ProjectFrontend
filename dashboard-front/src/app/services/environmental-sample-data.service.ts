import { Injectable } from '@angular/core';
import {environment} from '../../environments/environments';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EnvironmentalRecord} from '../interfaces/environmental-record';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentalSampleDataService {

  //this is the sample data
  private apiUrl = `${environment.API_BASE_URL}/sample/environmental-data`

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getEnvironmentalData(): Observable<EnvironmentalRecord[]> {
    // Check authentication before making request
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required to access environmental sample data');
    }
    return this.http.get<EnvironmentalRecord[]>(this.apiUrl);
  }
}
