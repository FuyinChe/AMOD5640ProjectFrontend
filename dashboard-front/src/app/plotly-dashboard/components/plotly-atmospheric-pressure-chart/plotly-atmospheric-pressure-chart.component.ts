import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtmosphericPressureService } from '../../../services/atmospheric-pressure.service';
import { PlotlyChartCardComponent } from '../plotly-chart-card/plotly-chart-card.component';

declare var Plotly: any;

@Component({
  selector: 'app-plotly-atmospheric-pressure-chart',
  standalone: true,
  imports: [CommonModule, PlotlyChartCardComponent],
  templateUrl: './plotly-atmospheric-pressure-chart.component.html',
  styleUrls: ['./plotly-atmospheric-pressure-chart.component.scss']
})
export class PlotlyAtmosphericPressureChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() groupBy: string = 'hour';
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  chartData: any[] = [];
  private chartLayout: any = {};
  private chartConfig: any = {};
  private rawData: any[] = [];

  constructor(private atmosphericPressureService: AtmosphericPressureService) {
    this.initializeChartConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate'] || changes['groupBy']) && this.startDate && this.endDate) {
      this.loadAtmosphericPressureData();
    }
  }

  private initializeChartConfig(): void {
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 600;
    this.chartLayout = {
      title: {
        text: 'Atmospheric Pressure Over Time',
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
          text: 'Atmospheric Pressure (kPa)',
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
      showlegend: true,
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: -0.3,
        x: 0.5,
        xanchor: 'center'
      }
    };

    this.chartConfig = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      toImageButtonOptions: {
        format: 'png',
        filename: 'atmospheric_pressure_chart',
        height: 500,
        width: 800,
        scale: 2
      }
    };
  }

  private loadAtmosphericPressureData(): void {
    this.atmosphericPressureService.getAtmosphericPressureData(this.startDate, this.endDate, this.groupBy).subscribe({
      next: (response: any) => {
        this.processAtmosphericPressureData(response);
      },
      error: (error) => {
        console.error('Error loading atmospheric pressure data:', error);
        this.showErrorChart();
      }
    });
  }

  private processAtmosphericPressureData(response: any): void {
    const data = response.data;
    const unit = response.unit || 'kPa';
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
      name: `Average Atmospheric Pressure (${unit})`,
      line: {
        color: '#34495e',
        width: 3
      },
      marker: {
        color: '#34495e',
        size: 6,
        line: {
          color: '#ffffff',
          width: 1
        }
      },
      fill: 'tonexty',
      fillcolor: 'rgba(52, 73, 94, 0.1)'
    }];

    // Update layout with dynamic title
    let groupLabel = 'Hourly';
    if (this.groupBy === 'weekly') groupLabel = 'Weekly';
    else if (this.groupBy === 'month') groupLabel = 'Monthly';
    this.chartLayout.title.text = `Atmospheric Pressure (${groupLabel}) Analysis`;
    this.chartLayout.yaxis.title.text = `Atmospheric Pressure (${unit})`;

    // Set x-axis label rotation based on grouping
    if (this.groupBy === 'month') {
      this.chartLayout.xaxis.tickangle = 0; // Horizontal for monthly view
    } else {
      this.chartLayout.xaxis.tickangle = -90; // Vertical for hourly and weekly views
    }

    // Responsive title font size
    this.chartLayout.title.font.size = (typeof window !== 'undefined' && window.innerWidth <= 600) ? 13 : 18;

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

    this.chartLayout.title.text = 'Atmospheric Pressure Data - Error Loading';
    this.chartLayout.annotations = [{
      text: 'Unable to load atmospheric pressure data. Please check your connection and try again.',
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
      this.loadAtmosphericPressureData();
    }
  }

  // Set grouping method
  setGroupBy(group: string): void {
    if (this.groupBy !== group) {
      this.groupBy = group;
      if (this.startDate && this.endDate) {
        this.loadAtmosphericPressureData();
      }
    }
  }

  // Download CSV data
  downloadCSV(): void {
    if (!this.rawData || this.rawData.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }

    const headers = ['Period', 'Average Atmospheric Pressure (kPa)'];
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
    link.setAttribute('download', `atmospheric_pressure_data_${this.startDate}_${this.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Download PNG image
  downloadPNG(): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      Plotly.downloadImage(this.chartContainer.nativeElement, {
        format: 'png',
        filename: `atmospheric_pressure_chart_${this.startDate}_${this.endDate}`,
        height: 500,
        width: 800,
        scale: 2
      });
    }
  }
} 