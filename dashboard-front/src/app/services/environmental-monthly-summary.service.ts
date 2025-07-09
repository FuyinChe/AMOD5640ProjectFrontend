import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MonthlySummary {
  year: number;
  month: number;
  month_name: string;
  record_count: number;
  air_temperature_max: number | null;
  air_temperature_min: number | null;
  air_temperature_mean: number | null;
  air_temperature_std: number | null;
  relative_humidity_max: number | null;
  relative_humidity_min: number | null;
  relative_humidity_mean: number | null;
  relative_humidity_std: number | null;
  shortwave_radiation_max: number | null;
  shortwave_radiation_min: number | null;
  shortwave_radiation_mean: number | null;
  shortwave_radiation_std: number | null;
  rainfall_total: number | null;
  rainfall_max: number | null;
  rainfall_mean: number | null;
  rainfall_std: number | null;
  soil_temp_5cm_max: number | null;
  soil_temp_5cm_min: number | null;
  soil_temp_5cm_mean: number | null;
  soil_temp_5cm_std: number | null;
  wind_speed_max: number | null;
  wind_speed_min: number | null;
  wind_speed_mean: number | null;
  wind_speed_std: number | null;
  snow_depth_max: number | null;
  snow_depth_min: number | null;
  snow_depth_mean: number | null;
  snow_depth_std: number | null;
  atmospheric_pressure_max: number | null;
  atmospheric_pressure_min: number | null;
  atmospheric_pressure_mean: number | null;
  atmospheric_pressure_std: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentalMonthlySummaryService {
  private apiUrl = `${environment.API_BASE_URL}/monthly-summary/`;

  constructor(private http: HttpClient) { }

  getMonthlySummary(start_date: string, end_date: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', start_date)
      .set('end_date', end_date);
    return this.http.get<any>(this.apiUrl, { params });
  }
} 