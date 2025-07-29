import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { RainfallService } from '../services/rainfall.service';
import { CropsYieldService, CropYield } from '../services/crops-yield.service';
import { AuthService } from '../services/auth.service';
import { RainfallYieldChartComponent } from './components/rainfall-yield-chart/rainfall-yield-chart.component';

interface RainfallData {
  date: string;
  avg_rainfall: number;
}

interface MonthlyRainfall {
  month: number;
  avgRainfall: number;
}

interface CombinedData {
  crops: CropYield[];
  rainfalls: MonthlyRainfall[];
  year: number;
  crop: string;
}

@Component({
  selector: 'app-exploring',
  standalone: true,
  imports: [CommonModule, RainfallYieldChartComponent],
  templateUrl: './exploring.component.html',
  styleUrls: ['./exploring.component.scss']
})
export class ExploringComponent implements OnInit, OnDestroy {
  cropsData: CropYield[] = [];
  rainfallData: RainfallData[] = [];
  combinedData: CombinedData | null = null;
  loading = false;
  error = '';
  startYear = 1992;
  endYear = 2023;
  
  private subscriptions = new Subscription();

  constructor(
    private cropsYieldService: CropsYieldService,
    private rainfallService: RainfallService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in, if not redirect to login page
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadInitialData(): void {
    this.loading = true;
    this.error = '';

    const cropsSub = this.cropsYieldService.getCropsYieldData().subscribe({
      next: (data) => {
        this.cropsData = data;
        this.loadCombinedData();
      },
      error: (err) => {
        this.error = 'Failed to load crops data: ' + err.message;
        this.loading = false;
      }
    });

    this.subscriptions.add(cropsSub);
  }

  loadCombinedData(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const rainfallSub = this.rainfallService.getRainfallDataByYear('', 'year').subscribe({
      next: (rainfallResponse) => {
        this.rainfallData = rainfallResponse.data || [];
        this.combineData();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load rainfall data: ' + err.message;
        this.loading = false;
      }
    });

    this.subscriptions.add(rainfallSub);
  }

  combineData(): void {
    // Filter crops data for the date range
    const filteredCrops = this.cropsData.filter(item => 
      item.year >= this.startYear && item.year <= this.endYear
    );

    // Create monthly rainfall averages (this will be handled by the chart component)
    const monthlyRainfalls: MonthlyRainfall[] = [];

    // Combine the data
    this.combinedData = {
      crops: filteredCrops,
      rainfalls: monthlyRainfalls,
      year: this.startYear,
      crop: 'all'
    };
  }

  getAverageRainfall(): number {
    if (!this.combinedData?.rainfalls || this.combinedData.rainfalls.length === 0) {
      return 0;
    }
    
    const sum = this.combinedData.rainfalls.reduce((acc: number, rainfall: MonthlyRainfall) => acc + rainfall.avgRainfall, 0);
    return sum / this.combinedData.rainfalls.length;
  }

  getCropYield(): number {
    if (!this.combinedData?.crops || this.combinedData.crops.length === 0) {
      return 0;
    }
    
    const sum = this.combinedData.crops.reduce((acc, crop) => acc + crop.yield, 0);
    return sum / this.combinedData.crops.length;
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }
} 