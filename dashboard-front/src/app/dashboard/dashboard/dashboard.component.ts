import {Component, OnInit} from '@angular/core';
import { SampleChartComponent } from '../sample-chart/sample-chart.component';
import {SnowDepthChartComponent} from '../snow-depth-chart/snow-depth-chart.component';
import {FormsModule} from '@angular/forms';
import {EnvironmentalMonthlySummaryService, MonthlySummary} from '../../services/environmental-monthly-summary.service';
import {HumidityChartComponent} from '../humidity-chart/humidity-chart.component';
import {RainfallChartComponent} from '../rainfall-chart/rainfall-chart.component';
import {SoilTemp5cmChartComponent} from '../soil-temp5cm-chart/soil-temp5cm-chart.component';
import {EnvironmentalMatrixTableComponent} from '../environmental-matrix-table/environmental-matrix-table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    SnowDepthChartComponent,
    FormsModule,
    HumidityChartComponent,
    RainfallChartComponent,
    SoilTemp5cmChartComponent,
    EnvironmentalMatrixTableComponent,
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dateRange = {
    start: '2023-01-01',
    end: '2023-12-31'
  };

  months: string[] = [];
  metrics: { name: string; unit: string; values: (number | null)[] }[] = [];

  // the real data for production
  // constructor(private dataService: EnvironmentalDataService) {}

  //the sample data for demo
  constructor(private monthlySummaryService: EnvironmentalMonthlySummaryService) {}

  activeTab: 'matrix' | 'snow-depth' | 'soil-temp5cm' | 'rainfall' | 'humidity' = 'matrix';

  setTab(tab: 'matrix' | 'snow-depth' | 'soil-temp5cm' | 'rainfall' | 'humidity') {
    this.activeTab = tab;
  }

  get rainfallLimit(): number {
    if (!this.dateRange.start || !this.dateRange.end) return 1000;
    const start = new Date(this.dateRange.start);
    const end = new Date(this.dateRange.end);
    // Add 1 to include the last hour of the end date
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)) + 1;
    return Math.max(hours, 1);
  }

  ngOnInit(): void {
    const start = this.dateRange.start || '2023-01-01';
    const end = this.dateRange.end || '2023-12-31';
    this.fetchMonthlySummary(start, end);
  }

  applyDateFilter(): void {
    if (this.dateRange.start && this.dateRange.end) {
      this.fetchMonthlySummary(this.dateRange.start, this.dateRange.end);
    }
  }

  fetchMonthlySummary(start: string, end: string): void {
    this.monthlySummaryService.getMonthlySummary(start, end).subscribe({
      next: (response) => {
        const data: MonthlySummary[] = response.data;
        this.months = data.map(d => d.month_name);
        this.metrics = [
          
          {
            name: 'Air Temp Max',
            unit: '°C',
            values: data.map(d => d.air_temperature_max)
          },
          {
            name: 'Air Temp Min',
            unit: '°C',
            values: data.map(d => d.air_temperature_min)
          },
          {
            name: 'Mean Air Temp',
            unit: '°C',
            values: data.map(d => d.air_temperature_mean)
          },
          {
            name: 'Air Temp Std',
            unit: '°C',
            values: data.map(d => d.air_temperature_std)
          },
          {
            name: 'Humidity Max',
            unit: '%',
            values: data.map(d => d.relative_humidity_max)
          },
          {
            name: 'Humidity Min',
            unit: '%',
            values: data.map(d => d.relative_humidity_min)
          },
          {
            name: 'Mean Humidity',
            unit: '%',
            values: data.map(d => d.relative_humidity_mean)
          },
          {
            name: 'Humidity Std',
            unit: '%',
            values: data.map(d => d.relative_humidity_std)
          },
          {
            name: 'Shortwave Radiation Max',
            unit: '',
            values: data.map(d => d.shortwave_radiation_max)
          },
          {
            name: 'Shortwave Radiation Min',
            unit: '',
            values: data.map(d => d.shortwave_radiation_min)
          },
          {
            name: 'Shortwave Radiation Mean',
            unit: '',
            values: data.map(d => d.shortwave_radiation_mean)
          },
          {
            name: 'Shortwave Radiation Std',
            unit: '',
            values: data.map(d => d.shortwave_radiation_std)
          },
          {
            name: 'Rainfall Total',
            unit: 'mm',
            values: data.map(d => d.rainfall_total)
          },
          {
            name: 'Rainfall Max',
            unit: 'mm',
            values: data.map(d => d.rainfall_max)
          },
          {
            name: 'Rainfall Mean',
            unit: 'mm',
            values: data.map(d => d.rainfall_mean)
          },
          {
            name: 'Rainfall Std',
            unit: 'mm',
            values: data.map(d => d.rainfall_std)
          },
          {
            name: 'Soil Temp 5cm Max',
            unit: '°C',
            values: data.map(d => d.soil_temp_5cm_max)
          },
          {
            name: 'Soil Temp 5cm Min',
            unit: '°C',
            values: data.map(d => d.soil_temp_5cm_min)
          },
          {
            name: 'Soil Temp 5cm Mean',
            unit: '°C',
            values: data.map(d => d.soil_temp_5cm_mean)
          },
          {
            name: 'Soil Temp 5cm Std',
            unit: '°C',
            values: data.map(d => d.soil_temp_5cm_std)
          },
          {
            name: 'Wind Speed Max',
            unit: 'm/s',
            values: data.map(d => d.wind_speed_max)
          },
          {
            name: 'Wind Speed Min',
            unit: 'm/s',
            values: data.map(d => d.wind_speed_min)
          },
          {
            name: 'Wind Speed Mean',
            unit: 'm/s',
            values: data.map(d => d.wind_speed_mean)
          },
          {
            name: 'Wind Speed Std',
            unit: 'm/s',
            values: data.map(d => d.wind_speed_std)
          },
          {
            name: 'Snow Depth Max',
            unit: 'cm',
            values: data.map(d => d.snow_depth_max)
          },
          {
            name: 'Snow Depth Min',
            unit: 'cm',
            values: data.map(d => d.snow_depth_min)
          },
          {
            name: 'Snow Depth Mean',
            unit: 'cm',
            values: data.map(d => d.snow_depth_mean)
          },
          {
            name: 'Snow Depth Std',
            unit: 'cm',
            values: data.map(d => d.snow_depth_std)
          },
          {
            name: 'Atmospheric Pressure Max',
            unit: 'hPa',
            values: data.map(d => d.atmospheric_pressure_max)
          },
          {
            name: 'Atmospheric Pressure Min',
            unit: 'hPa',
            values: data.map(d => d.atmospheric_pressure_min)
          },
          {
            name: 'Atmospheric Pressure Mean',
            unit: 'hPa',
            values: data.map(d => d.atmospheric_pressure_mean)
          },
          {
            name: 'Atmospheric Pressure Std',
            unit: 'hPa',
            values: data.map(d => d.atmospheric_pressure_std)
          }
        ];
      },
      error: (err) => {
        console.error('Error loading monthly summary:', err);
      }
    });
  }
}
