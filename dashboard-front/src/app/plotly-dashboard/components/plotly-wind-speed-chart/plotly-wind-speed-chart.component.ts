import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindSpeedService } from '../../../services/wind-speed.service';
import { PlotlyChartCardComponent } from '../plotly-chart-card/plotly-chart-card.component';

declare var Plotly: any;

@Component({
  selector: 'app-plotly-wind-speed-chart',
  standalone: true,
  imports: [CommonModule, PlotlyChartCardComponent],
  templateUrl: './plotly-wind-speed-chart.component.html',
  styleUrls: ['./plotly-wind-speed-chart.component.scss']
})
export class PlotlyWindSpeedChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() groupBy: string = 'hour';
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  chartData: any[] = [];
  private chartLayout: any = {};
  private chartConfig: any = {};
  private rawData: any[] = [];

  constructor(private windSpeedService: WindSpeedService) {
    this.initializeChartConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate'] || changes['groupBy']) && this.startDate && this.endDate) {
      this.loadWindSpeedData();
    }
  }

  private initializeChartConfig(): void {
    this.chartLayout = {
      title: {
        text: 'Wind Speed Over Time',
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
          text: 'Wind Speed (m/s)',
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
        filename: 'wind_speed_chart',
        height: 500,
        width: 800,
        scale: 2
      }
    };
  }

  private loadWindSpeedData(): void {
    this.windSpeedService.getWindSpeedData(this.startDate, this.endDate, this.groupBy).subscribe({
      next: (response: any) => {
        this.processWindSpeedData(response);
      },
      error: (error) => {
        console.error('Error loading wind speed data:', error);
        this.showErrorChart();
      }
    });
  }

  private processWindSpeedData(response: any): void {
    const data = response.data;
    const unit = response.unit || 'm/s';
    this.rawData = data; // Store raw data for CSV export

    // Process data for Plotly based on grouping
    let xValues: string[];
    let yValues: number[];
    
    if (this.groupBy === 'weekly') {
      xValues = data.map((d: any) => `W${String(d.week).padStart(2, '0')}`);
      yValues = data.map((d: any) => d.avg);
    } else if (this.groupBy === 'month') {
      const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      // Map API data to a dictionary for quick lookup
      const dataMap = new Map(data.map((d: any) => [d.period, d.avg]));
      // Build data for all months, using 0 if missing
      xValues = allMonths;
      yValues = allMonths.map(month => Number(dataMap.get(month) ?? 0));
    } else {
      xValues = data.map((d: any) => d.period || `Week ${d.week}`);
      yValues = data.map((d: any) => d.avg);
    }

    this.chartData = [{
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: `Average Wind Speed (${unit})`,
      line: {
        color: '#9b59b6',
        width: 3
      },
      marker: {
        color: '#9b59b6',
        size: 6,
        line: {
          color: '#ffffff',
          width: 1
        }
      },
      fill: 'tonexty',
      fillcolor: 'rgba(155, 89, 182, 0.1)'
    }];

    // Update layout with dynamic title
    let groupLabel = 'Hourly';
    if (this.groupBy === 'weekly') groupLabel = 'Weekly';
    else if (this.groupBy === 'month') groupLabel = 'Monthly';
    this.chartLayout.title.text = `Wind Speed (${groupLabel}) Analysis (${this.startDate} to ${this.endDate})`;
    this.chartLayout.yaxis.title.text = `Wind Speed (${unit})`;

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

    this.chartLayout.title.text = 'Wind Speed Data - Error Loading';
    this.chartLayout.annotations = [{
      text: 'Unable to load wind speed data. Please check your connection and try again.',
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
      this.loadWindSpeedData();
    }
  }

  // Set grouping method
  setGroupBy(group: string): void {
    if (this.groupBy !== group) {
      this.groupBy = group;
      if (this.startDate && this.endDate) {
        this.loadWindSpeedData();
      }
    }
  }

  // Download CSV data
  downloadCSV(): void {
    if (!this.rawData || this.rawData.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }

    const headers = ['Period', 'Average Wind Speed (m/s)'];
    const rows = [headers];
    
    this.rawData.forEach((item: any) => {
      const period = item.period || `Week ${item.week}`;
      const value = item.avg;
      rows.push([period, value]);
    });

    const csvContent = '\uFEFF' + rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `wind_speed_data_${this.startDate}_${this.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Download PNG image
  downloadPNG(): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      Plotly.downloadImage(this.chartContainer.nativeElement, {
        format: 'png',
        filename: `wind_speed_chart_${this.startDate}_${this.endDate}`,
        height: 500,
        width: 800,
        scale: 2
      });
    }
  }
} 