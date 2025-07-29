import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirTemperatureService } from '../../../services/air-temperature.service';
import { PlotlyChartCardComponent } from '../plotly-chart-card/plotly-chart-card.component';

declare var Plotly: any;

@Component({
  selector: 'app-plotly-air-temperature-chart',
  standalone: true,
  imports: [CommonModule, PlotlyChartCardComponent],
  templateUrl: './plotly-air-temperature-chart.component.html',
  styleUrls: ['./plotly-air-temperature-chart.component.scss']
})
export class PlotlyAirTemperatureChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() groupBy: string = 'hour';
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  chartData: any[] = [];
  private chartLayout: any = {};
  private chartConfig: any = {};
  private rawData: any[] = [];

  constructor(private airTemperatureService: AirTemperatureService) {
    this.initializeChartConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate'] || changes['groupBy']) && this.startDate && this.endDate) {
      this.loadAirTemperatureData();
    }
  }

  ngAfterViewInit(): void {
    this.resizeChart();
    window.addEventListener('resize', this.resizeChart.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeChart.bind(this));
  }

  private initializeChartConfig(): void {
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 600;
    this.chartLayout = {
      title: {
        text: 'Air Temperature',
        font: {
          size: isSmallScreen ? 13 : 18,
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
          text: 'Temperature (°C)',
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
      showlegend: false
    };

    this.chartConfig = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false
    };
  }

  private loadAirTemperatureData(): void {
    this.airTemperatureService.getAirTemperatureData(this.startDate, this.endDate, this.groupBy)
      .subscribe({
        next: (response) => {
          this.processAirTemperatureData(response);
        },
        error: (error) => {
          console.error('Error loading air temperature data:', error);
          this.showErrorChart();
        }
      });
  }

  private processAirTemperatureData(response: any): void {
    if (response.success && response.data && Array.isArray(response.data)) {
      this.rawData = response.data;
      
      // Process data for Plotly based on grouping
      let xValues: string[];
      let yValues: number[];
      
      if (this.groupBy === 'weekly') {
        xValues = response.data.map((d: any) => `W${String(d.week).padStart(2, '0')}`);
        yValues = response.data.map((d: any) => d.avg);
      } else if (this.groupBy === 'month') {
        const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Map API data to a dictionary for quick lookup
        const dataMap = new Map(response.data.map((d: any) => [d.period, d.avg]));
        // Build data for all months, using 0 if missing
        xValues = allMonths;
        yValues = allMonths.map(month => Number(dataMap.get(month) ?? 0));
      } else {
        xValues = response.data.map((d: any) => d.period || `Week ${d.week}`);
        yValues = response.data.map((d: any) => d.avg);
      }
      
      // Create trace for average temperature only
      const avgTrace = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Average Temperature',
        line: {
          color: '#3498db',
          width: 3
        },
        marker: {
          size: 6,
          color: '#3498db'
        },
        hovertemplate: '<b>%{x}</b><br>Average: %{y:.1f}°C<extra></extra>'
      };

      this.chartData = [avgTrace];
      
      // Update layout with dynamic title
      let groupLabel = 'Hourly';
      if (this.groupBy === 'weekly') groupLabel = 'Weekly';
      else if (this.groupBy === 'month') groupLabel = 'Monthly';
      this.chartLayout.title.text = `Air Temperature (${groupLabel})`;
      
      // Set x-axis label rotation based on grouping (same as humidity chart)
      if (this.groupBy === 'month') {
        this.chartLayout.xaxis.tickangle = 0; // Horizontal for monthly view
      } else {
        this.chartLayout.xaxis.tickangle = -90; // Vertical for hourly and weekly views
      }
      
      this.renderChart();
    } else {
      console.error('Invalid response format:', response);
      this.showErrorChart();
    }
  }

  private showErrorChart(): void {
    this.chartData = [{
      x: [],
      y: [],
      type: 'scatter',
      mode: 'markers',
      name: 'No Data Available',
      marker: {
        color: '#95a5a6',
        size: 10
      }
    }];

    this.chartLayout.title.text = 'Air Temperature Data Unavailable';
    this.chartLayout.annotations = [{
      text: 'Unable to load air temperature data. Please check your connection and try again.',
      showarrow: false,
      xref: 'paper',
      yref: 'paper',
      x: 0.5,
      y: 0.5,
      xanchor: 'center',
      yanchor: 'middle',
      font: {
        size: 14,
        color: '#7f8c8d'
      }
    }];

    this.renderChart();
  }

  private renderChart(): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      Plotly.newPlot(this.chartContainer.nativeElement, this.chartData, this.chartLayout, this.chartConfig);
    }
  }

  private resizeChart(): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      Plotly.Plots.resize(this.chartContainer.nativeElement);
    }
  }

  refreshChart(): void {
    if (this.startDate && this.endDate) {
      this.loadAirTemperatureData();
    }
  }

  setGroupBy(group: string): void {
    this.groupBy = group;
    if (this.startDate && this.endDate) {
      this.loadAirTemperatureData();
    }
  }

  downloadCSV(): void {
    if (!this.rawData || this.rawData.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }

    const headers = ['Period', 'Average Temperature (°C)'];
    const csvContent = [
      headers.join(','),
      ...this.rawData.map((item: any) => [
        item.period,
        item.avg?.toFixed(2) || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `air_temperature_data_${this.startDate}_to_${this.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadPNG(): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      Plotly.downloadImage(this.chartContainer.nativeElement, {
        format: 'png',
        filename: `air_temperature_chart_${this.startDate}_to_${this.endDate}`,
        height: 600,
        width: 800
      });
    }
  }
} 