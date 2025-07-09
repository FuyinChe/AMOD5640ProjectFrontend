import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { EnvironmentalRecord } from '../../interfaces/environmental-record';
import 'chartjs-adapter-luxon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import { HumidityService } from '../../services/humidity.service';

@Component({
  selector: 'app-humidity-chart',
  templateUrl: './humidity-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./humidity-chart.component.css']
})
export class HumidityChartComponent implements OnChanges {
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
        text: 'Humidity Over Time'
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
          text: 'Humidity (%)'
        },
        ticks: {
          // stepSize: 0.1, // Removed to let Chart.js auto-calculate
          autoSkip: true,
          maxTicksLimit: 8,
          callback: function(value: string | number) {
            return Number(value).toFixed(1);
          }
        },
        grid: {
          display: true,
          color: '#e0e0e0',
          lineWidth: 1
        }
      }
    }
  };

  private latestHumidityRawData: { period: string, avg: number }[] = [];

  constructor(private humidityService: HumidityService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate) {
      this.humidityService.getHumidityData(this.startDate, this.endDate, this.groupBy).subscribe((response: any) => {
        this.latestHumidityRawData = response.data;
        let avgPoints;
        if (this.groupBy === 'weekly') {
          avgPoints = response.data.map((d: { week: number, avg: number }) => ({ x: `W${String(d.week).padStart(2, '0')}`, y: d.avg }));
        } else if (this.groupBy === 'month') {
          // Remove monthly mode: do nothing or fallback to another mode
          this.chartData = [];
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
            label: `Avg Humidity (${response.unit || '%'})`,
            borderColor: '#00a085',
            backgroundColor: 'rgba(0, 160, 133, 0.2)',
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
              text: 'Humidity Over Time'
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
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
                minRotation: 45,
                maxRotation: 45,
                callback: (value: any, index: number, values: any) => {
                  if (this.groupBy === 'month' && typeof value === 'string' && value.length === 2 && !isNaN(Number(value))) {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return months[Number(value) - 1] || value;
                  }
                  // For weekly and all other cases, display the period string as is
                  return value;
                }
              }
            },
            y: {
              type: 'linear',
              min: 0,
              // max: max + padding, // Let Chart.js auto-calculate max
              title: {
                display: true,
                text: `Humidity (${response.unit || '%'})`
              },
              ticks: {
                // stepSize: 0.1, // Removed to let Chart.js auto-calculate
                autoSkip: true,
                maxTicksLimit: 8,
                callback: function(value: string | number) {
                  return Number(value).toFixed(1);
                }
              },
              grid: {
                display: true,
                color: '#e0e0e0',
                lineWidth: 1
              }
            }
          }
        };
        // After updating chartData and chartOptions, force chart update
        this.chart?.update();
        // Remove explicit x-axis labels for month group (let Chart.js use x values from data)
        // (No longer set or delete labels here)
      });
    }
  }

  setGroupBy(group: string) {
    if (this.groupBy !== group) {
      this.groupBy = group;
      if (this.startDate && this.endDate) {
        this.humidityService.getHumidityData(this.startDate, this.endDate, this.groupBy).subscribe((response: any) => {
          this.latestHumidityRawData = response.data;
          let avgPoints;
          if (this.groupBy === 'weekly') {
            avgPoints = response.data.map((d: { week: number, avg: number }) => ({ x: `W${String(d.week).padStart(2, '0')}`, y: d.avg }));
          } else if (this.groupBy === 'month') {
            const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            // Map API data to a dictionary for quick lookup
            const dataMap = new Map(response.data.map((d: { period: string, avg: number }) => [d.period, d.avg]));
            // Build data for all months, using 0 if missing
            avgPoints = allMonths.map(month => ({
              x: month,
              y: Number(dataMap.get(month) ?? 0)
            }));
            (this.chartOptions.scales as any)['x'].labels = allMonths;
          } else {
            avgPoints = response.data.map((d: { period: string, avg: number }) => ({ x: d.period, y: d.avg }));
          }
          const values = response.data.map((d: { avg: number }) => d.avg);
          const min = Math.min(...values);
          const max = Math.max(...values);
          this.chartData = [
            {
              data: avgPoints,
              label: `Avg Humidity (${response.unit || '%'})`,
              borderColor: '#00a085',
              backgroundColor: 'rgba(0, 160, 133, 0.2)',
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
          this.chartOptions.plugins.title.text = `Humidity (${groupLabel}) Over Time`;
          // X-axis ticks
          (this.chartOptions.scales as any)['x'] = (this.chartOptions.scales as any)['x'] || {};
          (this.chartOptions.scales as any)['x'].ticks = {
            autoSkip: true,
            maxTicksLimit: 10,
            minRotation: 45,
            maxRotation: 45,
            callback: (value: any, index: number, values: any) => {
              if (this.groupBy === 'month' && typeof value === 'string' && value.length === 2 && !isNaN(Number(value))) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months[Number(value) - 1] || value;
              }
              if (this.groupBy === 'weekly') {
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

  downloadCSV = () => {
    console.log('downloadCSV function called');
    console.log('latestHumidityRawData:', this.latestHumidityRawData);
    console.log('groupBy:', this.groupBy);
    
    if (!this.latestHumidityRawData || this.latestHumidityRawData.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }
    
    // Check the first data item to determine the structure
    const firstItem = this.latestHumidityRawData[0];
    console.log('First data item:', firstItem);
    
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    
    // Handle different data structures based on groupBy and available properties
    if (this.groupBy === 'weekly') {
      // For weekly data, check what properties are available
      if (firstItem.hasOwnProperty('total')) {
        // Some weekly data has total instead of min
        headers = ['Week', 'Avg', 'Total', 'Max'];
        rows = this.latestHumidityRawData.map((d: any) => [
          `W${String(d.week).padStart(2, '0')}`, 
          d.avg,
          d.total || '',
          d.max || ''
        ]);
      } else if (firstItem.hasOwnProperty('min')) {
        // Weekly data with min value
        headers = ['Week', 'Avg', 'Max', 'Min'];
        rows = this.latestHumidityRawData.map((d: any) => [
          `W${String(d.week).padStart(2, '0')}`, 
          d.avg,
          d.max || '',
          d.min || ''
        ]);
      } else {
        // Fallback for weekly data
        headers = ['Week', 'Avg', 'Max'];
        rows = this.latestHumidityRawData.map((d: any) => [
          `W${String(d.week).padStart(2, '0')}`, 
          d.avg,
          d.max || ''
        ]);
      }
    } else if (this.groupBy === 'month') {
      headers = ['Month', 'Avg', 'Max', 'Min'];
      rows = this.latestHumidityRawData.map((d: any) => [
        d.period, 
        d.avg,
        d.max || '',
        d.min || ''
      ]);
    } else {
      // For hourly data - check if we have max/min values
      if (firstItem.hasOwnProperty('max') && firstItem.hasOwnProperty('min')) {
        headers = ['Period', 'Avg', 'Max', 'Min'];
        rows = this.latestHumidityRawData.map((d: any) => [
          d.period, 
          d.avg,
          d.max,
          d.min
        ]);
      } else {
        headers = ['Period', 'Avg'];
        rows = this.latestHumidityRawData.map((d: any) => [d.period, d.avg]);
      }
    }
    
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map((e: (string | number)[]) => e.join(',')).join('\n');
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Try to get the unit from the service response or use a default
    let unit = '';
    try {
      // This is a bit of a workaround - we'll use the chart title to determine the unit
      const chartTitle = this.chartOptions.plugins?.title?.text || '';
      if (chartTitle.includes('Humidity')) {
        unit = '%';
      } else if (chartTitle.includes('Rainfall')) {
        unit = 'mm';
      } else if (chartTitle.includes('Snow')) {
        unit = 'cm';
      } else if (chartTitle.includes('Temperature')) {
        unit = '°C';
      }
    } catch (e) {
      unit = '';
    }
    
    a.download = `humidity-data-${this.groupBy}${unit ? `-${unit}` : ''}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  downloadPNG = () => {
    const canvas = document.querySelector('app-humidity-chart .humidity-chart__container canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'humidity-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      console.warn('Canvas element not found for PNG download');
    }
  }
}
