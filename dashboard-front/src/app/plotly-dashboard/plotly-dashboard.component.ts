import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlotlyHumidityChartComponent } from './components/plotly-humidity-chart/plotly-humidity-chart.component';
import { PlotlyRainfallChartComponent } from './components/plotly-rainfall-chart/plotly-rainfall-chart.component';
import { PlotlySoilTempChartComponent } from './components/plotly-soil-temp-chart/plotly-soil-temp-chart.component';
import { PlotlySnowDepthChartComponent } from './components/plotly-snow-depth-chart/plotly-snow-depth-chart.component';
import { PlotlySummaryHeatmapComponent } from './components/plotly-summary-heatmap/plotly-summary-heatmap.component';
import { EnvironmentalMonthlySummaryService, MonthlySummary } from '../services/environmental-monthly-summary.service';

@Component({
  selector: 'app-plotly-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PlotlyHumidityChartComponent,
    PlotlyRainfallChartComponent,
    PlotlySoilTempChartComponent,
    PlotlySnowDepthChartComponent,
    PlotlySummaryHeatmapComponent
  ],
  templateUrl: './plotly-dashboard.component.html',
  styleUrls: ['./plotly-dashboard.component.scss']
})
export class PlotlyDashboardComponent implements OnInit {
  activeTab: string = 'overview';
  dateRange = {
    start: '2023-01-01',
    end: '2023-12-31'
  };

  // Monthly summary data
  months: string[] = [];
  metrics: Array<{name: string, unit: string, values: (number | null)[]}> = [];

  // Lazy loaded components
  summaryHeatmapComponent: any = null;
  humidityChartComponent: any = null;
  rainfallChartComponent: any = null;
  soilTempChartComponent: any = null;
  snowDepthChartComponent: any = null;

  constructor(private monthlySummaryService: EnvironmentalMonthlySummaryService) {}

  ngOnInit(): void {
    this.fetchMonthlySummary(this.dateRange.start, this.dateRange.end);
    this.loadComponentForTab('overview');
  }

  onDateRangeChange(): void {
    // Remove auto-fetch on date change; only fetch on apply
  }

  onApplyDateRange(): void {
    this.fetchMonthlySummary(this.dateRange.start, this.dateRange.end);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.loadComponentForTab(tab);
  }

  private async loadComponentForTab(tab: string): Promise<void> {
    switch (tab) {
      case 'overview':
        if (!this.summaryHeatmapComponent) {
          const { PlotlySummaryHeatmapComponent } = await import('./components/plotly-summary-heatmap/plotly-summary-heatmap.component');
          this.summaryHeatmapComponent = PlotlySummaryHeatmapComponent;
        }
        break;
      case 'humidity':
        if (!this.humidityChartComponent) {
          const { PlotlyHumidityChartComponent } = await import('./components/plotly-humidity-chart/plotly-humidity-chart.component');
          this.humidityChartComponent = PlotlyHumidityChartComponent;
        }
        break;
      case 'rainfall':
        if (!this.rainfallChartComponent) {
          const { PlotlyRainfallChartComponent } = await import('./components/plotly-rainfall-chart/plotly-rainfall-chart.component');
          this.rainfallChartComponent = PlotlyRainfallChartComponent;
        }
        break;
      case 'soil-temp':
        if (!this.soilTempChartComponent) {
          const { PlotlySoilTempChartComponent } = await import('./components/plotly-soil-temp-chart/plotly-soil-temp-chart.component');
          this.soilTempChartComponent = PlotlySoilTempChartComponent;
        }
        break;
      case 'snow-depth':
        if (!this.snowDepthChartComponent) {
          const { PlotlySnowDepthChartComponent } = await import('./components/plotly-snow-depth-chart/plotly-snow-depth-chart.component');
          this.snowDepthChartComponent = PlotlySnowDepthChartComponent;
        }
        break;
    }
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private fetchMonthlySummary(start: string, end: string): void {
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
            name: 'Rainfall Total',
            unit: 'mm',
            values: data.map(d => d.rainfall_total)
          },
          {
            name: 'Soil Temp 5cm Mean',
            unit: '°C',
            values: data.map(d => d.soil_temp_5cm_mean)
          },
          {
            name: 'Wind Speed Mean',
            unit: 'm/s',
            values: data.map(d => d.wind_speed_mean)
          },
          {
            name: 'Snow Depth Mean',
            unit: 'cm',
            values: data.map(d => d.snow_depth_mean)
          }
        ];
      },
      error: (err) => {
        console.error('Error loading monthly summary:', err);
      }
    });
  }
} 