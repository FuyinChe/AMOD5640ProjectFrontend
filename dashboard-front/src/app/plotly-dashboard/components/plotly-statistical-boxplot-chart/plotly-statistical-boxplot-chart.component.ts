import { Component, Input, OnChanges, SimpleChanges, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticalBoxplotService, BoxplotApiResponse } from '../../../services/statistical-boxplot.service';
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

  chartData: any[] = [];
  chartLayout: any = {};
  isLoading = false;
  error: string | null = null;
  private shouldRender = false;

  constructor(private boxplotService: StatisticalBoxplotService) {
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
    this.isLoading = true;
    this.error = null;
    this.boxplotService.getBoxplotData(this.startDate, this.endDate, this.metrics).subscribe({
      next: (response: BoxplotApiResponse) => {
        this.chartData = this.processBoxplotData(response.data);
        this.isLoading = false;
        this.shouldRender = true;
      },
      error: (err) => {
        this.error = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }

  renderChart() {
    const chartDiv = document.getElementById('statisticalBoxplotChart');
    if (chartDiv && this.chartData.length) {
      Plotly.newPlot(chartDiv, this.chartData, this.chartLayout, {responsive: true});
    }
  }

  processBoxplotData(data: any): any[] {
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
    return this.metrics.map(metric => {
      const arr = data[metric];
      const color = colorMap[metric] || '#ff4136';
      if (!arr || !arr[0] || !arr[0].statistics) {
        // No data for this metric, show an empty box
        return {
          type: 'box',
          name: this.getMetricLabel(metric),
          x: [this.getMetricLabel(metric)],
          y: [],
          boxpoints: 'outliers',
          marker: { color, outliercolor: '#22223b', size: 8 },
          line: { color, width: 2 },
          width: 0.3,
          fillcolor: color,
          orientation: 'v'
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
        y: stats.outliers || [],
        boxpoints: 'outliers',
        marker: { color, outliercolor: '#22223b', size: 8 },
        line: { color, width: 2 },
        width: 0.3,
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
        tickfont: { size: 16, color: '#22223b' }
      },
      boxmode: 'group',
      showlegend: false,
      margin: { t: 40, b: 60, l: 60, r: 40 },
      height: 500,
      plot_bgcolor: '#fff',
      paper_bgcolor: '#fff'
    };
  }
} 