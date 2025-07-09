import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import { RainfallService } from '../../services/rainfall.service';

@Component({
  selector: 'app-rainfall-chart',
  templateUrl: './rainfall-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./rainfall-chart.component.css']
})
export class RainfallChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() limit: number = 1000;

  chartData: ChartDataset<'line', { x: Date; y: number }[]>[] = [];
  chartType: 'line' = 'line';

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Rainfall (mm) Over Time'
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
          text: 'Rainfall (mm)'
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

  private latestRainfallRawData: { period: string, avg: number }[] = [];
  groupBy: string = 'hour';

  constructor(private rainfallService: RainfallService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate) {
      this.rainfallService.getHourlyRainfallData(this.startDate, this.endDate).subscribe((response: any) => {
        this.latestRainfallRawData = response.data;
        let avgPoints;
        if (this.groupBy === 'weekly') {
          avgPoints = response.data.map((d: { week: number, avg: number }) => ({ x: `W${String(d.week).padStart(2, '0')}`, y: d.avg }));
        } else {
          avgPoints = response.data.map((d: { period: string, avg: number }) => ({ x: d.period, y: d.avg }));
        }
        const values = response.data.map((d: { avg: number }) => d.avg);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.2 || 1;
        this.chartData = [
          {
            data: avgPoints,
            label: `Avg Rainfall (${response.unit || 'mm'})`,
            borderColor: '#0088cc',
            backgroundColor: 'rgba(0, 136, 204, 0.2)',
            tension: 0.3,
            pointRadius: (response.data.length > 30) ? 2 : 3,
            borderWidth: 3,
            fill: true
          }
        ];
        this.chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Rainfall (mm) Over Time'
            },
            legend: { display: true }
          },
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Period'
              }
            },
            y: {
              type: 'linear',
              min: 0,
              // max: max + padding, // Let Chart.js auto-calculate max
              title: {
                display: true,
                text: `Rainfall (${response.unit || 'mm'})`
              },
              grid: {
                display: true,
                color: '#e0e0e0',
                lineWidth: 1
              },
              ticks: {
                // stepSize: 0.1, // Removed to let Chart.js auto-calculate
                autoSkip: true,
                maxTicksLimit: 5, // fewer ticks for small range
                // stepSize: 0.02, // optionally uncomment for more control
                callback: function(value: string | number) {
                  return Number(value).toFixed(2); // show two decimals
                }
              }
            }
          }
        };
        const groupByMode = this.groupBy;
        (this.chartOptions.scales as any)['x'] = (this.chartOptions.scales as any)['x'] || {};
        (this.chartOptions.scales as any)['x'].ticks = {
          autoSkip: true,
          maxTicksLimit: 10,
          minRotation: 45,
          maxRotation: 45,
          callback: function(value: any, index: number, values: any) {
            if (groupByMode === 'month' && typeof value === 'string' && value.length === 2 && !isNaN(Number(value))) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return months[Number(value) - 1] || value;
            }
            // For weekly and all other cases, display the period string as is
            return value;
          }
        };
      });
    }
  }

  setGroupBy(group: string) {
    if (this.groupBy !== group) {
      this.groupBy = group;
      if (this.startDate && this.endDate) {
        this.rainfallService.getHourlyRainfallData(this.startDate, this.endDate, this.groupBy).subscribe((response: any) => {
          this.latestRainfallRawData = response.data;
          let avgPoints;
          if (this.groupBy === 'weekly') {
            avgPoints = response.data.map((d: { week: number, avg: number }) => ({ x: `W${String(d.week).padStart(2, '0')}`, y: d.avg }));
          } else {
            avgPoints = response.data.map((d: { period: string, avg: number }) => ({ x: d.period, y: d.avg }));
          }
          const values = response.data.map((d: { avg: number }) => d.avg);
          const min = Math.min(...values);
          const max = Math.max(...values);
          this.chartData = [
            {
              data: avgPoints,
              label: `Avg Rainfall (${response.unit || 'mm'})`,
              borderColor: '#0088cc',
              backgroundColor: 'rgba(0, 136, 204, 0.2)',
              tension: 0.3,
              pointRadius: (response.data.length > 30) ? 2 : 3,
              borderWidth: 3,
              fill: true
            }
          ];
          // Update chart title
          let groupLabel = 'Hourly';
          if (this.groupBy === 'weekly') groupLabel = 'Weekly';
          else if (this.groupBy === 'month') groupLabel = 'Monthly';
          this.chartOptions.plugins = this.chartOptions.plugins || {};
          this.chartOptions.plugins.title = this.chartOptions.plugins.title || {};
          this.chartOptions.plugins.title.text = `Rainfall (${groupLabel}) Over Time`;
          // X-axis ticks
          const groupByMode = this.groupBy;
          (this.chartOptions.scales as any)['x'] = (this.chartOptions.scales as any)['x'] || {};
          (this.chartOptions.scales as any)['x'].ticks = {
            autoSkip: true,
            maxTicksLimit: 10,
            minRotation: 45,
            maxRotation: 45,
            callback: function(value: any, index: number, values: any) {
              if (groupByMode === 'month' && typeof value === 'string' && value.length === 2 && !isNaN(Number(value))) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months[Number(value) - 1] || value;
              }
              if (groupByMode === 'weekly') {
                return 'W' + value;
              }
              return value;
            }
          };
          // Y-axis: let Chart.js auto-calculate max
          (this.chartOptions.scales as any)['y'] = (this.chartOptions.scales as any)['y'] || {};
          (this.chartOptions.scales as any)['y'].min = 0;
        });
      }
    }
  }

  downloadCSV() {
    if (!this.latestRainfallRawData || this.latestRainfallRawData.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }
    
    const headers = ['Period', 'Avg Rainfall (mm)'];
    const rows = this.latestRainfallRawData.map((d: { period: string, avg: number }) => [d.period, d.avg]);
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map((e: (string | number)[]) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rainfall-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPNG() {
    const canvas = document.querySelector('app-rainfall-chart .rainfall-chart__container canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'rainfall-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      console.warn('Canvas element not found for PNG download');
    }
  }
}
