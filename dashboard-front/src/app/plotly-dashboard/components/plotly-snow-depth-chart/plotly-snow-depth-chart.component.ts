import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnowDepthService } from '../../../services/snow-depth.service';

declare var Plotly: any;

@Component({
  selector: 'app-plotly-snow-depth-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plotly-snow-depth-chart.component.html',
  styleUrls: ['./plotly-snow-depth-chart.component.scss']
})
export class PlotlySnowDepthChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private chartData: any[] = [];
  private chartLayout: any = {};
  private chartConfig: any = {};

  constructor(private snowDepthService: SnowDepthService) {
    this.initializeChartConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate']) && this.startDate && this.endDate) {
      this.loadSnowDepthData();
    }
  }

  private initializeChartConfig(): void {
    this.chartLayout = {
      title: {
        text: 'Snow Depth Over Time',
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
          text: 'Snow Depth (cm)',
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
        filename: 'snow_depth_chart',
        height: 500,
        width: 800,
        scale: 2
      }
    };
  }

  private loadSnowDepthData(): void {
    this.snowDepthService.getSnowDepthData(this.startDate, this.endDate, 'day').subscribe({
      next: (response: any) => {
        this.processSnowDepthData(response);
      },
      error: (error) => {
        console.error('Error loading snow depth data:', error);
        this.showErrorChart();
      }
    });
  }

  private processSnowDepthData(response: any): void {
    const data = response.data;
    const unit = response.unit || 'cm';

    // Process data for Plotly
    const xValues = data.map((d: any) => d.period || `Week ${d.week}`);
    const yValues = data.map((d: any) => d.avg);

    this.chartData = [{
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: `Average Snow Depth (${unit})`,
      line: {
        color: '#0056b3',
        width: 3
      },
      marker: {
        color: '#0056b3',
        size: 6,
        line: {
          color: '#ffffff',
          width: 1
        }
      },
      fill: 'tonexty',
      fillcolor: 'rgba(0, 86, 179, 0.1)'
    }];

    // Update layout with dynamic title
    this.chartLayout.title.text = `Snow Depth Analysis (${this.startDate} to ${this.endDate})`;
    this.chartLayout.yaxis.title.text = `Snow Depth (${unit})`;

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

    this.chartLayout.title.text = 'Snow Depth Data - Error Loading';
    this.chartLayout.annotations = [{
      text: 'Unable to load snow depth data. Please check your connection and try again.',
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

  refreshChart(): void {
    if (this.startDate && this.endDate) {
      this.loadSnowDepthData();
    }
  }

  exportChart(format: 'png' | 'svg' | 'pdf' = 'png'): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      Plotly.downloadImage(this.chartContainer.nativeElement, {
        format: format,
        filename: `snow_depth_chart_${this.startDate}_${this.endDate}`,
        height: 500,
        width: 800,
        scale: 2
      });
    }
  }
} 