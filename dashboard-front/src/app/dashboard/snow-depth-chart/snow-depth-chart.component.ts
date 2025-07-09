import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import { SnowDepthService } from '../../services/snow-depth.service';

@Component({
  selector: 'app-snow-depth-chart',
  templateUrl: './snow-depth-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./snow-depth-chart.component.css']
})
export class SnowDepthChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() groupBy: string = 'hour';
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartDataset<'line', { x: string; y: number }[]>[] = [];
  chartType: 'line' = 'line';
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Snow Depth Over Time'
      },
      legend: { display: false }
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Period'
        },
        grid: {
          display: true,
          color: '#e0e0e0',
          lineWidth: 1
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Snow Depth'
        },
        grid: {
          display: true,
          color: '#e0e0e0',
          lineWidth: 1
        },
        ticks: {
          // stepSize: 0.1, // Removed to let Chart.js auto-calculate
          autoSkip: true,
          maxTicksLimit: 8,
          callback: function(value: string | number) {
            return Number(value).toFixed(1);
          }
        }
      }
    }
  };

  private latestSnowDepthRawData: { period: string, avg: number, max: number, min: number }[] = [];
  private unit: string = 'cm';

  constructor(private snowDepthService: SnowDepthService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate) {
      this.snowDepthService.getSnowDepthData(this.startDate, this.endDate, this.groupBy).subscribe((response: any) => {
        this.latestSnowDepthRawData = response.data;
        this.unit = response.unit || 'cm';
        let avgPoints;
        if (this.groupBy === 'weekly') {
          avgPoints = response.data.map((d: { week: number, avg: number }) => ({ x: `W${String(d.week).padStart(2, '0')}`, y: d.avg }));
          this.chartData = [
            {
              data: avgPoints,
              label: `Avg Snow Depth (${this.unit})`,
              borderColor: '#0056b3',
              backgroundColor: 'rgba(0, 86, 179, 0.2)',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 3,
              fill: true
            }
          ];
        } else if (this.groupBy === 'month') {
          // Remove monthly mode: do nothing or fallback to another mode
          this.chartData = [];
        } else {
          avgPoints = response.data.map((d: { period: string, avg: number }) => ({ x: d.period, y: d.avg }));
          this.chartData = [
            {
              data: avgPoints,
              label: `Avg Snow Depth (${this.unit})`,
              borderColor: '#0056b3',
              backgroundColor: 'rgba(0, 86, 179, 0.2)',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 3,
              fill: true
            }
          ];
        }
        const values = response.data.map((d: { avg: number }) => d.avg);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.2 || 1;
        this.chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Snow Depth Over Time'
            },
            legend: { display: true }
          },
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Period'
              },
              grid: {
                display: true,
                color: '#e0e0e0',
                lineWidth: 1
              }
            },
            y: {
              type: 'linear',
              min: 0,
              // max: max + padding, // Let Chart.js auto-calculate max
              title: {
                display: true,
                text: `Snow Depth (${this.unit})`
              },
              grid: {
                display: true,
                color: '#e0e0e0',
                lineWidth: 1
              },
              ticks: {
                // stepSize: 0.1, // Removed to let Chart.js auto-calculate
                autoSkip: true,
                maxTicksLimit: 8,
                callback: function(value: string | number) {
                  return Number(value).toFixed(1);
                }
              }
            }
          }
        };
        // Improve x-axis label and ticks for all groupBy
        const groupByMode = this.groupBy; // capture the current groupBy value
        (this.chartOptions.scales as any)['x'] = (this.chartOptions.scales as any)['x'] || {};
        (this.chartOptions.scales as any)['x'].ticks = {
          autoSkip: groupByMode === 'month' ? false : true,
          maxTicksLimit: 10,
          minRotation: 45,
          maxRotation: 45,
          callback: function(value: any, index: number, values: any) {
            if (groupByMode === 'month') {
              // For month, just return the value (month name)
              return value;
            }
            if (groupByMode === 'weekly') {
              return 'W' + value;
            }
            // For all other cases, display the period string as is
            return value;
          }
        };
        // Remove explicit x-axis labels for month group (let Chart.js use x values from data)
        // (No longer set or delete labels here)
        // Reduce point radius for many points
        this.chartData[0].pointRadius = (response.data.length > 30) ? 2 : 3;
        // After updating chartData and chartOptions, force chart update
        this.chart?.update();
      });
    }
  }

  setGroupBy(group: string) {
    if (this.groupBy !== group) {
      this.groupBy = group;
      // Manually trigger data reload
      if (this.startDate && this.endDate) {
        this.snowDepthService.getSnowDepthData(this.startDate, this.endDate, this.groupBy).subscribe((response: any) => {
          this.latestSnowDepthRawData = response.data;
          this.unit = response.unit || 'cm';
          let avgPoints;
          if (this.groupBy === 'weekly') {
            avgPoints = response.data.map((d: { week: number, avg: number }) => ({ x: `W${String(d.week).padStart(2, '0')}`, y: d.avg }));
            this.chartData = [
              {
                data: avgPoints,
                label: `Avg Snow Depth (${this.unit})`,
                borderColor: '#0056b3',
                backgroundColor: 'rgba(0, 86, 179, 0.2)',
                tension: 0.3,
                pointRadius: 3,
                borderWidth: 3,
                fill: true
              }
            ];
          } else if (this.groupBy === 'month') {
            const monthData = response.data.map((d: { period: string, avg: number }) => ({
              x: d.period,
              y: d.avg
            }));
            this.chartData = [
              {
                data: monthData,
                label: `Avg Snow Depth (${this.unit})`,
                borderColor: '#0056b3',
                backgroundColor: 'rgba(0, 86, 179, 0.2)',
                tension: 0.3,
                pointRadius: 3,
                borderWidth: 3,
                fill: true
              }
            ];
            (this.chartOptions.scales as any)['x'].ticks = {
              autoSkip: false,
              maxTicksLimit: 12,
              minRotation: 45,
              maxRotation: 45
            };
          } else {
            avgPoints = response.data.map((d: { period: string, avg: number }) => ({ x: d.period, y: d.avg }));
            this.chartData = [
              {
                data: avgPoints,
                label: `Avg Snow Depth (${this.unit})`,
                borderColor: '#0056b3',
                backgroundColor: 'rgba(0, 86, 179, 0.2)',
                tension: 0.3,
                pointRadius: 3,
                borderWidth: 3,
                fill: true
              }
            ];
          }
          // Update chart title with groupBy
          let groupLabel = 'Hourly';
          if (this.groupBy === 'weekly') groupLabel = 'Weekly';
          else if (this.groupBy === 'month') groupLabel = 'Monthly';
          this.chartOptions.plugins = this.chartOptions.plugins || {};
          this.chartOptions.plugins.title = this.chartOptions.plugins.title || {};
          this.chartOptions.plugins.title.text = `Snow Depth (${groupLabel}) Over Time`;
          // Improve x-axis label for monthly
          if (this.groupBy === 'month' || this.groupBy === 'weekly') {
            this.chartOptions.scales = this.chartOptions.scales || {};
            (this.chartOptions.scales as any)['x'] = (this.chartOptions.scales as any)['x'] || {};
            const groupByMode = this.groupBy;
            (this.chartOptions.scales as any)['x'].ticks = {
              autoSkip: groupByMode === 'month' ? false : true,
              maxTicksLimit: 10,
              minRotation: 45,
              maxRotation: 45,
              callback: function(value: any, index: number, values: any) {
                if (groupByMode === 'month') {
                  // For month, just return the value (month name)
                  return value;
                }
                if (groupByMode === 'weekly') {
                  return 'W' + value;
                }
                return value;
              }
            };
          }
          // Remove explicit x-axis labels for month group (let Chart.js use x values from data)
          // (No longer set or delete labels here)
        });
      }
    }
  }

  // Helper to parse 'period' (e.g., '01-01 00:00') to Date using the year from startDate
  private parsePeriodToDate(period: string, startDate: string): Date {
    const year = new Date(startDate).getFullYear();
    return new Date(`${year}-${period}:00`); // e.g., '2023-01-01 00:00:00'
  }

  downloadCSV() {
    if (!this.latestSnowDepthRawData || this.latestSnowDepthRawData.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }
    
    const headers = ['Period', `Avg Snow Depth (${this.unit})`];
    const rows = this.latestSnowDepthRawData.map((d: { period: string, avg: number }) => [d.period, d.avg]);
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map((e: (string | number)[]) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snow-depth-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPNG() {
    const canvas = document.querySelector('app-snow-depth-chart .snow-depth-chart__container canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'snow-depth-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      console.warn('Canvas element not found for PNG download');
    }
  }
}
