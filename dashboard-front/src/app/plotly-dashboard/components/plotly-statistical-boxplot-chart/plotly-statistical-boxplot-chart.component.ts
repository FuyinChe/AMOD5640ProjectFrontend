import { Component, Input, OnChanges, SimpleChanges, AfterViewChecked, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatisticalBoxplotService, BoxplotApiResponse } from '../../../services/statistical-boxplot.service';
import { AuthService } from '../../../services/auth.service';
declare var Plotly: any;

@Component({
  selector: 'app-plotly-statistical-boxplot-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plotly-statistical-boxplot-chart.component.html',
  styleUrls: ['./plotly-statistical-boxplot-chart.component.scss']
})
export class PlotlyStatisticalBoxplotChartComponent implements OnChanges, AfterViewChecked {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() metrics: string[] = [];
  @ViewChild('statisticalBoxplotChart', { static: false }) chartContainer!: ElementRef;
  @Output() downloadCSV = new EventEmitter<void>();

  chartData: any[] = [];
  chartLayout: any = {};
  isLoading = false;
  error: string | null = null;
  private shouldRender = false;

  constructor(
    private boxplotService: StatisticalBoxplotService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeChartLayout();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['startDate'] || changes['endDate'] || changes['metrics']) && this.startDate && this.endDate) {
      this.fetchBoxplotData();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldRender && this.chartData.length && !this.isLoading && !this.error) {
      this.renderChart();
      this.shouldRender = false;
    }
  }

  fetchBoxplotData() {
    // Check authentication before making request
    if (!this.authService.isLoggedIn()) {
      localStorage.setItem('intendedDestination', '/plotly-dashboard');
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.boxplotService.getBoxplotData(this.startDate, this.endDate, this.metrics).subscribe({
      next: (response: BoxplotApiResponse) => {
        // Always show all available metrics, ignore this.metrics
        const metricsToShow = Object.keys(response.data);
        console.log('Boxplot API data keys:', Object.keys(response.data));
        console.log('Boxplot metricsToShow:', metricsToShow);
        this.chartData = this.processBoxplotData(response.data, metricsToShow);
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
          this.error = 'Failed to load data';
        }
      }
    });
  }

  renderChart() {
    const chartDiv = document.getElementById('statisticalBoxplotChart');
    if (chartDiv && this.chartData.length) {
      // Warn for degenerate statistics
      this.chartData.forEach(trace => {
        if (
          trace.q1[0] === trace.median[0] &&
          trace.median[0] === trace.q3[0] &&
          trace.q1[0] === trace.q3[0]
        ) {
          console.warn(`[Boxplot] Degenerate statistics for metric '${trace.name}': All quartiles are equal (${trace.q1[0]})`);
        }
        // Set larger box width
        trace.width = 0.5;
        // Log detailed trace info
        console.log(`[Boxplot Trace] name: ${trace.name}, x: ${trace.x}, min: ${trace.lowerfence[0]}, q1: ${trace.q1[0]}, median: ${trace.median[0]}, q3: ${trace.q3[0]}, max: ${trace.upperfence[0]}`);
      });
      // Log the full chartData array
      console.log('Final chartData:', this.chartData);
      // Use smaller fixed width for compact display
      const compactLayout = {
        ...this.chartLayout,
        width: undefined, // Responsive width
        autosize: true
      };
      // Force Plotly to purge the chart div before drawing
      if (typeof Plotly !== 'undefined' && typeof Plotly.purge === 'function') {
        Plotly.purge(chartDiv);
      }
      Plotly.newPlot(chartDiv, this.chartData, compactLayout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
      });
    }
  }

  processBoxplotData(data: any, metricsToShow?: string[]): any[] {
    const colorMap: { [key: string]: string } = {
      humidity: '#00aaff',
      temperature: '#ff5733',
      wind_speed: '#6c5ce7',
      rainfall: '#00b894',
      snow_depth: '#0984e3',
      shortwave_radiation: '#fdcb6e',
      atmospheric_pressure: '#636e72',
      soil_temperature: '#e17055'
    };
    const allMetrics = [
      'humidity',
      'temperature',
      'wind_speed',
      'rainfall',
      'snow_depth',
      'shortwave_radiation',
      'atmospheric_pressure',
      'soil_temperature'
    ];
    return allMetrics.map(metric => {
      const arr = data[metric];
      const color = colorMap[metric] || '#ff4136';
      if (!arr || !arr[0] || !arr[0].statistics || arr[0].statistics.q1 == null || arr[0].statistics.median == null || arr[0].statistics.q3 == null) {
        // Show a placeholder/empty box for missing or invalid data
        return {
          type: 'box',
          name: this.getMetricLabel(metric),
          x: [this.getMetricLabel(metric)],
          y: [],
          q1: [0],
          median: [0],
          q3: [0],
          lowerfence: [0],
          upperfence: [0],
          marker: { color: '#cccccc' },
          line: { color: '#cccccc', width: 2, dash: 'dot' },
          width: 0.15,
          fillcolor: '#f8f8f8',
          orientation: 'v',
          boxpoints: false,
          hovertemplate: `<b>${this.getMetricLabel(metric)}</b><br>No data available<extra></extra>`
        };
      }
      const stats = arr[0].statistics;
      return {
        type: 'box',
        name: this.getMetricLabel(metric),
        x: [this.getMetricLabel(metric)],
        q1: [stats.q1],
        median: [stats.median],
        q3: [stats.q3],
        lowerfence: [stats.min],
        upperfence: [stats.max],
        boxpoints: 'outliers',
        marker: { color, outliercolor: '#22223b', size: 8 },
        line: { color, width: 2 },
        width: 0.15,
        fillcolor: color,
        orientation: 'v',
        hovertemplate:
          `<b>${this.getMetricLabel(metric)}</b><br>` +
          'Min: %{lowerfence[0]:.2f}<br>' +
          'Q1: %{q1[0]:.2f}<br>' +
          'Median: %{median[0]:.2f}<br>' +
          'Q3: %{q3[0]:.2f}<br>' +
          'Max: %{upperfence[0]:.2f}<br>' +
          '<extra></extra>'
      };
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

  initializeChartLayout() {
    this.chartLayout = {
      title: {
        text: 'Environmental Data Boxplot (Overall)',
        font: { size: 18, color: '#2c3e50' }
      },
      yaxis: {
        title: 'Value',
        gridcolor: '#e0e0e0',
        zeroline: false
      },
      xaxis: {
        tickfont: { size: 11, color: '#22223b' },
        tickangle: -90 // Vertical labels (same as humidity chart)
      },
      boxmode: 'group',
      showlegend: false,
      margin: { t: 70, b: 140, l: 60, r: 40 }, // Increased bottom margin for x label visibility
      height: 600,
      width: 1100, // Increased width for better spacing
      plot_bgcolor: '#fff',
      paper_bgcolor: '#fff'
    };
  }

  downloadPNG(): void {
    const chartDiv = document.getElementById('statisticalBoxplotChart');
    if (chartDiv) {
      Plotly.downloadImage(chartDiv, {
        format: 'png',
        filename: `boxplot_chart_${this.startDate}_${this.endDate}`,
        height: 600,
        width: 1100,
        scale: 4
      });
    }
  }
} 