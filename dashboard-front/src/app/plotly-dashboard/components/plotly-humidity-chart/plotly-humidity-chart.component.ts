import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HumidityService } from '../../../services/humidity.service';

declare var Plotly: any;

@Component({
  selector: 'app-plotly-humidity-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plotly-humidity-chart.component.html',
  styleUrls: ['./plotly-humidity-chart.component.scss']
})
export class PlotlyHumidityChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private chartData: any[] = [];
  private chartLayout: any = {};
  private chartConfig: any = {};

  constructor(private humidityService: HumidityService) {
    this.initializeChartConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate']) && this.startDate && this.endDate) {
      this.loadHumidityData();
    }
  }

  private initializeChartConfig(): void {
    this.chartLayout = {
      title: {
        text: 'Humidity Over Time',
        font: {
          size: 20,
          color: '#2c3e50'
        }
      },
      xaxis: {
        title: {
          text: 'Time Period',
          font: {
            size: 14,
            color: '#2c3e50'
          }
        },
        gridcolor: '#ecf0f1',
        showgrid: true
      },
      yaxis: {
        title: {
          text: 'Humidity (%)',
          font: {
            size: 14,
            color: '#2c3e50'
          }
        },
        gridcolor: '#ecf0f1',
        showgrid: true
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Museo Sans, sans-serif'
      },
      margin: {
        l: 60,
        r: 40,
        t: 60,
        b: 60
      },
      hovermode: 'closest',
      showlegend: true
    };

    this.chartConfig = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      toImageButtonOptions: {
        format: 'png',
        filename: 'humidity_chart',
        height: 500,
        width: 800,
        scale: 2
      }
    };
  }

  private loadHumidityData(): void {
    this.humidityService.getHumidityData(this.startDate, this.endDate, 'day').subscribe({
      next: (response: any) => {
        this.processHumidityData(response);
      },
      error: (error) => {
        console.error('Error loading humidity data:', error);
        this.showErrorChart();
      }
    });
  }

  private processHumidityData(response: any): void {
    const data = response.data;
    const unit = response.unit || '%';

    // Process data for Plotly
    const xValues = data.map((d: any) => d.period || `Week ${d.week}`);
    const yValues = data.map((d: any) => d.avg);

    this.chartData = [{
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: `Average Humidity (${unit})`,
      line: {
        color: '#00a085',
        width: 3
      },
      marker: {
        color: '#00a085',
        size: 6,
        line: {
          color: '#ffffff',
          width: 1
        }
      },
      fill: 'tonexty',
      fillcolor: 'rgba(0, 160, 133, 0.1)'
    }];

    // Update layout with dynamic title
    this.chartLayout.title.text = `Humidity Analysis (${this.startDate} to ${this.endDate})`;
    this.chartLayout.yaxis.title.text = `Humidity (${unit})`;

    this.renderChart();
  }

  private showErrorChart(): void {
    this.chartData = [{
      x: [],
      y: [],
      type: 'scatter',
      mode: 'markers',
      name: 'No Data Available',
      marker: {
        color: '#e74c3c',
        size: 10
      }
    }];

    this.chartLayout.title.text = 'Humidity Data - Error Loading';
    this.chartLayout.annotations = [{
      text: 'Unable to load humidity data. Please check your connection and try again.',
      showarrow: false,
      xref: 'paper',
      yref: 'paper',
      x: 0.5,
      y: 0.5,
      xanchor: 'center',
      yanchor: 'middle',
      font: {
        size: 16,
        color: '#7f8c8d'
      }
    }];

    this.renderChart();
  }

  private renderChart(): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      Plotly.newPlot(
        this.chartContainer.nativeElement,
        this.chartData,
        this.chartLayout,
        this.chartConfig
      );
    }
  }

  // Public method to refresh chart
  refreshChart(): void {
    if (this.startDate && this.endDate) {
      this.loadHumidityData();
    }
  }

  // Public method to export chart
  exportChart(format: 'png' | 'svg' | 'pdf' = 'png'): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      Plotly.downloadImage(this.chartContainer.nativeElement, {
        format: format,
        filename: `humidity_chart_${this.startDate}_${this.endDate}`,
        height: 500,
        width: 800,
        scale: 2
      });
    }
  }
} 