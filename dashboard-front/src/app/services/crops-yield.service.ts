import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CropYield {
  year: number;
  county: string;
  crop: string;
  yield: number;
}

@Injectable({
  providedIn: 'root'
})
export class CropsYieldService {
  constructor(private http: HttpClient) {}

  getCropsYieldData(): Observable<CropYield[]> {
    return this.http.get('/crops_yield.csv', { responseType: 'text' })
      .pipe(
        map(csv => this.parseCSV(csv))
      );
  }

  getCropsYieldByYear(year: number): Observable<CropYield[]> {
    return this.getCropsYieldData().pipe(
      map(data => data.filter(item => item.year === year))
    );
  }

  getCropsYieldByCrop(crop: string): Observable<CropYield[]> {
    return this.getCropsYieldData().pipe(
      map(data => data.filter(item => item.crop.toLowerCase() === crop.toLowerCase()))
    );
  }

  getCropsYieldByYearRange(startYear: number, endYear: number): Observable<CropYield[]> {
    return this.getCropsYieldData().pipe(
      map(data => data.filter(item => item.year >= startYear && item.year <= endYear))
    );
  }

  private parseCSV(csv: string): CropYield[] {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const data: CropYield[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = lines[i].split(',');
      const year = parseInt(values[0]);
      const county = values[1];
      const crop = values[2];
      const yieldValue = values[3];

      // Skip invalid data (like 'x' values)
      if (isNaN(year) || yieldValue === 'x' || yieldValue === undefined) {
        continue;
      }

      data.push({
        year,
        county,
        crop,
        yield: parseFloat(yieldValue)
      });
    }

    return data.sort((a, b) => a.year - b.year);
  }
} 