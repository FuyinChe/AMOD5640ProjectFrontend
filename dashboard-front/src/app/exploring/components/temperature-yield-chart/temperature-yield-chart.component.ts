import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CropsYieldService, CropYield } from '../../../services/crops-yield.service';
import { AirTemperatureService } from '../../../services/air-temperature.service';

interface TemperatureData {
  date: string;
  avg_temperature: number;
}

interface ChartDataPoint {
  year: number;
  temperature: number;
  yield: number;
  crop: string;
}

@Component({
  selector: 'app-temperature-yield-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temperature-yield-chart.component.html',
  styleUrls: ['./temperature-yield-chart.component.scss']
})
export class TemperatureYieldChartComponent implements OnInit, OnDestroy {
  @Input() selectedCrop: string = 'corn';
  @Input() startYear: number = 1990;
  @Input() endYear: number = 2020;

  chartData: ChartDataPoint[] = [];
  loading = false;
  error = '';
  
  private subscriptions = new Subscription();

  constructor(
    private cropsYieldService: CropsYieldService,
    private airTemperatureService: AirTemperatureService
  ) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadChartData(): void {
    this.loading = true;
    this.error = '';

    // Load crops data for the specified range
    const cropsSub = this.cropsYieldService.getCropsYieldByYearRange(this.startYear, this.endYear)
      .subscribe({
        next: (cropsData) => {
          const filteredCrops = cropsData.filter(item => 
            item.crop.toLowerCase() === this.selectedCrop.toLowerCase()
          );
          
          // Load temperature data for each year
          this.loadTemperatureDataForYears(filteredCrops);
        },
        error: (err) => {
          this.error = 'Failed to load crops data: ' + err.message;
          this.loading = false;
        }
      });

    this.subscriptions.add(cropsSub);
  }

  private loadTemperatureDataForYears(cropsData: CropYield[]): void {
    const temperaturePromises = cropsData.map(crop => 
      this.airTemperatureService.getAirTemperatureDataByYear(crop.year.toString(), 'year').toPromise()
    );

    Promise.all(temperaturePromises)
      .then(temperatureResults => {
        this.combineData(cropsData, temperatureResults);
        this.loading = false;
      })
      .catch(err => {
        this.error = 'Failed to load temperature data: ' + err.message;
        this.loading = false;
      });
  }

  private combineData(cropsData: CropYield[], temperatureResults: any[]): void {
    this.chartData = [];

    cropsData.forEach((crop, index) => {
      const tempData = temperatureResults[index];
      if (tempData && tempData.data && tempData.data.length > 0) {
        // Calculate average temperature for the year
        const avgTemp = tempData.data.reduce((sum: number, item: any) => 
          sum + (item.avg_temperature || 0), 0) / tempData.data.length;

        this.chartData.push({
          year: crop.year,
          temperature: avgTemp,
          yield: crop.yield,
          crop: crop.crop
        });
      }
    });

    // Sort by year
    this.chartData.sort((a, b) => a.year - b.year);
  }

  getCorrelation(): number {
    if (this.chartData.length < 2) return 0;

    const n = this.chartData.length;
    const sumX = this.chartData.reduce((sum, point) => sum + point.temperature, 0);
    const sumY = this.chartData.reduce((sum, point) => sum + point.yield, 0);
    const sumXY = this.chartData.reduce((sum, point) => sum + point.temperature * point.yield, 0);
    const sumX2 = this.chartData.reduce((sum, point) => sum + point.temperature * point.temperature, 0);
    const sumY2 = this.chartData.reduce((sum, point) => sum + point.yield * point.yield, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator !== 0 ? numerator / denominator : 0;
  }

  getAverageTemperature(): number {
    if (this.chartData.length === 0) return 0;
    const sum = this.chartData.reduce((acc, point) => acc + point.temperature, 0);
    return sum / this.chartData.length;
  }

  getAverageYield(): number {
    if (this.chartData.length === 0) return 0;
    const sum = this.chartData.reduce((acc, point) => acc + point.yield, 0);
    return sum / this.chartData.length;
  }

  getTemperatureRange(): { min: number; max: number } {
    if (this.chartData.length === 0) return { min: 0, max: 0 };
    
    const temps = this.chartData.map(point => point.temperature);
    return {
      min: Math.min(...temps),
      max: Math.max(...temps)
    };
  }

  getYieldRange(): { min: number; max: number } {
    if (this.chartData.length === 0) return { min: 0, max: 0 };
    
    const yields = this.chartData.map(point => point.yield);
    return {
      min: Math.min(...yields),
      max: Math.max(...yields)
    };
  }

  getTemperatureLinePoints(): string {
    if (this.chartData.length === 0) return '';
    
    const tempRange = this.getTemperatureRange();
    const width = 800;
    const height = 200;
    const padding = 40;
    
    return this.chartData.map((point, index) => {
      const x = padding + (index / (this.chartData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.temperature - tempRange.min) / (tempRange.max - tempRange.min)) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
  }

  getTemperatureAreaPoints(): string {
    if (this.chartData.length === 0) return '';
    
    const linePoints = this.getTemperatureLinePoints();
    const tempRange = this.getTemperatureRange();
    const width = 800;
    const height = 200;
    const padding = 40;
    
    const bottomY = height - padding;
    const bottomPoints = this.chartData.map((point, index) => {
      const x = padding + (index / (this.chartData.length - 1)) * (width - 2 * padding);
      return `${x},${bottomY}`;
    }).reverse().join(' ');
    
    return `${linePoints} ${bottomPoints}`;
  }

  getBarHeight(yieldValue: number): number {
    if (this.chartData.length === 0) return 0;
    
    const yieldRange = this.getYieldRange();
    const maxHeight = 80; // Maximum height percentage
    return Math.max(5, (yieldValue - yieldRange.min) / (yieldRange.max - yieldRange.min) * maxHeight);
  }

  getBarPosition(index: number): number {
    if (this.chartData.length === 0) return 0;
    
    const barWidth = 80 / this.chartData.length; // 80% total width
    return 10 + (index / (this.chartData.length - 1)) * 80; // 10% padding on each side
  }
} 