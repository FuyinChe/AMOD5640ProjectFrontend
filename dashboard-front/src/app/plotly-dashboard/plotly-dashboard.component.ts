import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlotlyHumidityChartComponent } from './components/plotly-humidity-chart/plotly-humidity-chart.component';
import { PlotlyRainfallChartComponent } from './components/plotly-rainfall-chart/plotly-rainfall-chart.component';
import { PlotlySoilTempChartComponent } from './components/plotly-soil-temp-chart/plotly-soil-temp-chart.component';
import { PlotlySnowDepthChartComponent } from './components/plotly-snow-depth-chart/plotly-snow-depth-chart.component';
import { PlotlySummaryHeatmapComponent } from './components/plotly-summary-heatmap/plotly-summary-heatmap.component';
import { PlotlyShortwaveRadiationChartComponent } from './components/plotly-shortwave-radiation-chart/plotly-shortwave-radiation-chart.component';
import { PlotlyWindSpeedChartComponent } from './components/plotly-wind-speed-chart/plotly-wind-speed-chart.component';
import { PlotlyAtmosphericPressureChartComponent } from './components/plotly-atmospheric-pressure-chart/plotly-atmospheric-pressure-chart.component';
import { EnvironmentalMonthlySummaryService, MonthlySummary } from '../services/environmental-monthly-summary.service';
import { PlotlyStatisticalBoxplotChartComponent } from './components/plotly-statistical-boxplot-chart/plotly-statistical-boxplot-chart.component';
import { PlotlyStatisticalHistogramChartComponent } from './components/plotly-statistical-histogram-chart/plotly-statistical-histogram-chart.component';

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
    PlotlySummaryHeatmapComponent,
    PlotlyShortwaveRadiationChartComponent,
    PlotlyWindSpeedChartComponent,
    PlotlyAtmosphericPressureChartComponent,
    PlotlyStatisticalBoxplotChartComponent,
    PlotlyStatisticalHistogramChartComponent
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

  // Add for responsive tab dropdown
  isSmallScreen: boolean = false;
  tabOptions = [
    { label: 'Overview', value: 'overview' },
    { label: 'Statistical Analysis', value: 'statistical-analysis' },
    { label: 'Humidity', value: 'humidity' },
    { label: 'Rainfall', value: 'rainfall' },
    { label: 'Soil Temperature', value: 'soil-temp' },
    { label: 'Snow Depth', value: 'snow-depth' },
    { label: 'Shortwave Radiation', value: 'shortwave-radiation' },
    { label: 'Wind Speed', value: 'wind-speed' },
    { label: 'Atmospheric Pressure', value: 'atmospheric-pressure' },
  ];

  // Monthly summary data
  months: string[] = [];
  metrics: Array<{name: string, unit: string, values: (number | null)[]}> = [];

  // Lazy loaded components
  summaryHeatmapComponent: any = null;
  humidityChartComponent: any = null;
  rainfallChartComponent: any = null;
  soilTempChartComponent: any = null;
  snowDepthChartComponent: any = null;
  shortwaveRadiationChartComponent: any = null;
  windSpeedChartComponent: any = null;
  atmosphericPressureChartComponent: any = null;
  statisticalBoxplotChartComponent: any = null;
  statisticalHistogramChartComponent: any = null;

  @ViewChild(PlotlyStatisticalBoxplotChartComponent) boxplotChart?: PlotlyStatisticalBoxplotChartComponent;
  @ViewChild(PlotlyStatisticalHistogramChartComponent) histogramChart?: PlotlyStatisticalHistogramChartComponent;

  selectedMetrics: string[] = [
    'humidity',
    'temperature',
    'wind_speed',
    'rainfall',
    'snow_depth',
    'shortwave_radiation',
    'atmospheric_pressure',
    'soil_temperature'
  ];

  statisticalChartType: 'boxplot' | 'histogram' = 'boxplot';

  constructor(private monthlySummaryService: EnvironmentalMonthlySummaryService) {}

  ngOnInit(): void {
    this.fetchMonthlySummary(this.dateRange.start, this.dateRange.end);
    this.loadComponentForTab('overview');
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

  checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 600;
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
      case 'shortwave-radiation':
        if (!this.shortwaveRadiationChartComponent) {
          const { PlotlyShortwaveRadiationChartComponent } = await import('./components/plotly-shortwave-radiation-chart/plotly-shortwave-radiation-chart.component');
          this.shortwaveRadiationChartComponent = PlotlyShortwaveRadiationChartComponent;
        }
        break;
      case 'wind-speed':
        if (!this.windSpeedChartComponent) {
          const { PlotlyWindSpeedChartComponent } = await import('./components/plotly-wind-speed-chart/plotly-wind-speed-chart.component');
          this.windSpeedChartComponent = PlotlyWindSpeedChartComponent;
        }
        break;
      case 'atmospheric-pressure':
        if (!this.atmosphericPressureChartComponent) {
          const { PlotlyAtmosphericPressureChartComponent } = await import('./components/plotly-atmospheric-pressure-chart/plotly-atmospheric-pressure-chart.component');
          this.atmosphericPressureChartComponent = PlotlyAtmosphericPressureChartComponent;
        }
        break;
      case 'statistical-analysis':
        if (!this.statisticalBoxplotChartComponent) {
          const { PlotlyStatisticalBoxplotChartComponent } = await import('./components/plotly-statistical-boxplot-chart/plotly-statistical-boxplot-chart.component');
          this.statisticalBoxplotChartComponent = PlotlyStatisticalBoxplotChartComponent;
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
    // Set loading state on the heatmap component if available
    if (this.summaryHeatmapComponent && this.summaryHeatmapComponent.isLoading !== undefined) {
      this.summaryHeatmapComponent.isLoading = true;
      this.summaryHeatmapComponent.error = null;
    }
    this.monthlySummaryService.getMonthlySummary(start, end).subscribe({
      next: (response) => {
        const data: MonthlySummary[] = response.data;
        this.months = data.map(d => d.month_name);
        this.metrics = [
          // Air Temperature
          { name: 'Air Temp Max', unit: '°C', values: data.map(d => d.air_temperature_max) },
          { name: 'Air Temp Min', unit: '°C', values: data.map(d => d.air_temperature_min) },
          { name: 'Mean Air Temp', unit: '°C', values: data.map(d => d.air_temperature_mean) },
          { name: 'Air Temp Std', unit: '°C', values: data.map(d => d.air_temperature_std) },

          // Humidity
          { name: 'Humidity Max', unit: '%', values: data.map(d => d.relative_humidity_max) },
          { name: 'Humidity Min', unit: '%', values: data.map(d => d.relative_humidity_min) },
          { name: 'Mean Humidity', unit: '%', values: data.map(d => d.relative_humidity_mean) },
          { name: 'Humidity Std', unit: '%', values: data.map(d => d.relative_humidity_std) },

          // Shortwave Radiation
          { name: 'Shortwave Radiation Max', unit: '', values: data.map(d => d.shortwave_radiation_max) },
          { name: 'Shortwave Radiation Min', unit: '', values: data.map(d => d.shortwave_radiation_min) },
          { name: 'Shortwave Radiation Mean', unit: '', values: data.map(d => d.shortwave_radiation_mean) },
          { name: 'Shortwave Radiation Std', unit: '', values: data.map(d => d.shortwave_radiation_std) },

          // Rainfall
          { name: 'Rainfall Total', unit: 'mm', values: data.map(d => d.rainfall_total) },
          { name: 'Rainfall Max', unit: 'mm', values: data.map(d => d.rainfall_max) },
          { name: 'Rainfall Mean', unit: 'mm', values: data.map(d => d.rainfall_mean) },
          { name: 'Rainfall Std', unit: 'mm', values: data.map(d => d.rainfall_std) },

          // Soil Temp 5cm
          { name: 'Soil Temp 5cm Max', unit: '°C', values: data.map(d => d.soil_temp_5cm_max) },
          { name: 'Soil Temp 5cm Min', unit: '°C', values: data.map(d => d.soil_temp_5cm_min) },
          { name: 'Soil Temp 5cm Mean', unit: '°C', values: data.map(d => d.soil_temp_5cm_mean) },
          { name: 'Soil Temp 5cm Std', unit: '°C', values: data.map(d => d.soil_temp_5cm_std) },

          // Wind Speed
          { name: 'Wind Speed Max', unit: 'm/s', values: data.map(d => d.wind_speed_max) },
          { name: 'Wind Speed Min', unit: 'm/s', values: data.map(d => d.wind_speed_min) },
          { name: 'Wind Speed Mean', unit: 'm/s', values: data.map(d => d.wind_speed_mean) },
          { name: 'Wind Speed Std', unit: 'm/s', values: data.map(d => d.wind_speed_std) },

          // Snow Depth
          { name: 'Snow Depth Max', unit: 'cm', values: data.map(d => d.snow_depth_max) },
          { name: 'Snow Depth Min', unit: 'cm', values: data.map(d => d.snow_depth_min) },
          { name: 'Snow Depth Mean', unit: 'cm', values: data.map(d => d.snow_depth_mean) },
          { name: 'Snow Depth Std', unit: 'cm', values: data.map(d => d.snow_depth_std) },

          // Atmospheric Pressure
          { name: 'Atmospheric Pressure Max', unit: 'hPa', values: data.map(d => d.atmospheric_pressure_max) },
          { name: 'Atmospheric Pressure Min', unit: 'hPa', values: data.map(d => d.atmospheric_pressure_min) },
          { name: 'Atmospheric Pressure Mean', unit: 'hPa', values: data.map(d => d.atmospheric_pressure_mean) },
          { name: 'Atmospheric Pressure Std', unit: 'hPa', values: data.map(d => d.atmospheric_pressure_std) },
        ];
        // Set loading to false after data is loaded
        if (this.summaryHeatmapComponent && this.summaryHeatmapComponent.isLoading !== undefined) {
          this.summaryHeatmapComponent.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading monthly summary:', err);
        // Set error state on the heatmap component
        if (this.summaryHeatmapComponent && this.summaryHeatmapComponent.error !== undefined) {
          this.summaryHeatmapComponent.error = 'Failed to load overview data';
          this.summaryHeatmapComponent.isLoading = false;
        }
      }
    });
  }

  // Download methods for statistical analysis charts
  onDownloadBoxplotCSV(): void {
    // This will be handled by the child component via event emitter
    console.log('Download boxplot CSV requested');
  }

  onDownloadBoxplotPNG(): void {
    this.boxplotChart?.downloadPNG();
  }

  onDownloadHistogramCSV(): void {
    // This will be handled by the child component via event emitter
    console.log('Download histogram CSV requested');
  }

  onDownloadHistogramPNG(): void {
    this.histogramChart?.downloadPNG();
  }
} 