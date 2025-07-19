import { Component, Input, OnChanges, SimpleChanges, AfterViewChecked, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatisticalHistogramService, HistogramApiResponse } from '../../../services/statistical-histogram.service';
import { AuthService } from '../../../services/auth.service';
declare var Plotly: any;

@Component({
  selector: 'app-plotly-statistical-histogram-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plotly-statistical-histogram-chart.component.html',
  styleUrls: ['./plotly-statistical-histogram-chart.component.scss']
})
export class PlotlyStatisticalHistogramChartComponent implements OnChanges, AfterViewChecked {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() metrics: string[] = [];
  @Output() downloadCSV = new EventEmitter<void>();

  histograms: { metric: string, chartData: any[], chartLayout: any }[] = [];
  isLoading = false;
  error: string | null = null;
  private shouldRender = false;

  constructor(
    private histogramService: StatisticalHistogramService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['startDate'] || changes['endDate'] || changes['metrics']) && this.startDate && this.endDate && this.metrics.length) {
      this.fetchHistogramData();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldRender && this.histograms.length && !this.isLoading && !this.error) {
      this.histograms.forEach(hist => {
        const chartDiv = document.getElementById('histogram-' + hist.metric);
        if (chartDiv) {
          Plotly.newPlot(chartDiv, hist.chartData, hist.chartLayout, {responsive: true});
        }
      });
      this.shouldRender = false;
    }
  }

  fetchHistogramData() {
    // Check authentication before making request
    if (!this.authService.isLoggedIn()) {
      localStorage.setItem('intendedDestination', '/plotly-dashboard');
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.histogramService.getHistogramData(this.startDate, this.endDate, this.metrics).subscribe({
      next: (response: HistogramApiResponse) => {
        this.histograms = this.metrics.map(metric => {
          const metricData = response.data[metric];
          const color = this.getMetricColor(metric);
          if (!metricData) return { metric, chartData: [], chartLayout: {} };
          const bins = metricData.bins;
          return {
            metric,
            chartData: [{
              x: bins.map(b => (b.bin_start + b.bin_end) / 2),
              y: bins.map(b => b.count),
              type: 'bar',
              marker: { color },
              name: this.getMetricLabel(metric),
              width: 0.9 * (bins[0]?.bin_end - bins[0]?.bin_start || 1)
            }],
            chartLayout: {
              title: this.getMetricLabel(metric) + ' Histogram',
              xaxis: { title: this.getMetricLabel(metric), gridcolor: '#e0e0e0' },
              yaxis: { title: 'Count', gridcolor: '#e0e0e0' },
              margin: { t: 40, b: 60, l: 60, r: 40 },
              height: 300,
              plot_bgcolor: '#fff',
              paper_bgcolor: '#fff',
              showlegend: false
            }
          };
        });
        this.isLoading = false;
        this.shouldRender = true;
      },
      error: (err) => {
        this.isLoading = false;
        
        // Handle authentication errors
        if (err.status === 401) {
          this.error = 'Authentication required. Please log in to view statistical data.';
          localStorage.setItem('intendedDestination', '/plotly-dashboard');
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load histogram data';
        }
      }
    });
  }

  getMetricLabel(metric: string): string {
    const labels: any = {
      humidity: 'Humidity (%)',
      temperature: 'Temperature (°C)',
      wind_speed: 'Wind Speed (m/s)',
      rainfall: 'Rainfall (mm)',
      snow_depth: 'Snow Depth (cm)',
      shortwave_radiation: 'Shortwave Radiation (W/m²)',
      atmospheric_pressure: 'Atmospheric Pressure (kPa)',
      soil_temperature: 'Soil Temperature (°C)'
    };
    return labels[metric] || metric;
  }
  getMetricColor(metric: string): string {
    const colorMap: any = {
      humidity: '#00aaff',
      temperature: '#ff5733',
      wind_speed: '#6c5ce7',
      rainfall: '#00b894',
      snow_depth: '#0984e3',
      shortwave_radiation: '#fdcb6e',
      atmospheric_pressure: '#636e72',
      soil_temperature: '#e17055'
    };
    return colorMap[metric] || '#ff4136';
  }

  downloadPNG(): void {
    // Download all visible histograms as separate PNGs
    this.histograms.forEach(hist => {
      const chartDiv = document.getElementById('histogram-' + hist.metric);
      if (chartDiv) {
        Plotly.downloadImage(chartDiv, {
          format: 'png',
          filename: `histogram_chart_${hist.metric}_${this.startDate}_${this.endDate}`,
          height: 400,
          width: 500,
          scale: 2
        });
      }
    });
  }
} 