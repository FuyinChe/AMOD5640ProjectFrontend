import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CropsYieldService, CropYield } from '../../../services/crops-yield.service';
import { RainfallService } from '../../../services/rainfall.service';
import { AuthService } from '../../../services/auth.service'; // Added import for AuthService

declare var Plotly: any;

interface RainfallData {
  date: string;
  avg_rainfall: number;
}

interface ChartDataPoint {
  year: number;
  rainfall: number;
  cornYield: number;
  soybeanYield: number;
  wheatYield: number;
}

@Component({
  selector: 'app-rainfall-yield-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rainfall-yield-chart.component.html',
  styleUrls: ['./rainfall-yield-chart.component.scss']
})
export class RainfallYieldChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() startYear: number = 1992;
  @Input() endYear: number = 2023;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  chartData: ChartDataPoint[] = [];
  loading = false;
  error = '';
  private dataReady = false;
  private viewReady = false;
  private chartRetryCount = 0;
  private maxRetries = 10;
  
  private subscriptions = new Subscription();

  constructor(
    private cropsYieldService: CropsYieldService,
    private rainfallService: RainfallService,
    private authService: AuthService // Added AuthService to constructor
  ) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // Remove window resize listener
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    if (this.chartContainer && this.chartContainer.nativeElement && this.chartData.length > 0) {
      Plotly.relayout(this.chartContainer.nativeElement, {
        width: window.innerWidth * 0.95,
        height: 600,
        margin: {
          l: 80,
          r: 180, // Ensure right margin is maintained on resize
          t: 80,
          b: 150
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    console.log('View initialized, chartContainer available:', !!this.chartContainer);
    if (this.dataReady) {
      this.createPlotlyChart();
    }
    
    // Add window resize listener
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  loadChartData(): void {
    this.loading = true;
    this.error = '';

    console.log('Loading chart data for years:', this.startYear, 'to', this.endYear);

    // Load crops data for the specified range
    const cropsSub = this.cropsYieldService.getCropsYieldByYearRange(this.startYear, this.endYear)
      .subscribe({
        next: (cropsData) => {
          console.log('Crops data loaded:', cropsData);
          console.log('Years in crops data:', [...new Set(cropsData.map(crop => crop.year))]);
          // Load rainfall data for each year
          this.loadRainfallDataForYears(cropsData);
        },
        error: (err) => {
          this.error = 'Failed to load crops data: ' + err.message;
          this.loading = false;
        }
      });

    this.subscriptions.add(cropsSub);
  }

  private loadRainfallDataForYears(cropsData: CropYield[]): void {
    // Get unique years from crops data
    const years = [...new Set(cropsData.map(crop => crop.year))];
    
    console.log('Loading rainfall data for years:', years);
    console.log('User authenticated:', this.authService.isLoggedIn());
    
    // Use the updated API endpoint that returns data for all years
    const rainfallSub = this.rainfallService.getRainfallDataByYear('', 'year')
      .subscribe({
        next: (rainfallResponse) => {
          console.log('Rainfall API response:', rainfallResponse);
          this.combineData(cropsData, rainfallResponse, years);
          this.loading = false;
        },
        error: (err) => {
          console.error('Rainfall API error details:', err);
          this.error = 'Failed to load rainfall data: ' + (err.message || err.statusText || 'Unknown error');
          this.loading = false;
        }
      });

    this.subscriptions.add(rainfallSub);
  }

  private combineData(cropsData: CropYield[], rainfallResponse: any, years: number[]): void {
    this.chartData = [];

    // Extract rainfall data from the response
    const rainfallData = rainfallResponse.data || [];

    // Create a complete range of years from startYear to endYear
    const completeYears = [];
    for (let year = this.startYear; year <= this.endYear; year++) {
      completeYears.push(year);
    }

    completeYears.forEach((year) => {
      const yearCrops = cropsData.filter(crop => crop.year === year);
      
      // Find rainfall data for this year
      const yearRainfall = rainfallData.find((item: any) => item.year === year);
      const totalRainfall = yearRainfall ? yearRainfall.total : 0;

      // Get yields for each crop type
      const cornYield = yearCrops.find(crop => crop.crop.toLowerCase() === 'corn')?.yield || 0;
      const soybeanYield = yearCrops.find(crop => crop.crop.toLowerCase() === 'soybean')?.yield || 0;
      const wheatYield = yearCrops.find(crop => crop.crop.toLowerCase() === 'wheat')?.yield || 0;

      this.chartData.push({
        year: year,
        rainfall: totalRainfall,
        cornYield: cornYield,
        soybeanYield: soybeanYield,
        wheatYield: wheatYield
      });
    });

    // Sort by year
    this.chartData.sort((a, b) => a.year - b.year);
    
    console.log('Combined chart data:', this.chartData);
    console.log('Years in chart data:', this.chartData.map(d => d.year));
    
    this.dataReady = true;
    console.log('Data ready, viewReady:', this.viewReady, 'chartContainer available:', !!this.chartContainer);
    if (this.viewReady) {
      this.createPlotlyChart();
    }
  }

  private createPlotlyChart(): void {
    if (this.chartData.length === 0) return;
    
    // Check if chart container is available
    if (!this.chartContainer || !this.chartContainer.nativeElement) {
      if (this.chartRetryCount < this.maxRetries) {
        this.chartRetryCount++;
        console.warn(`Chart container not available, retry ${this.chartRetryCount}/${this.maxRetries}`);
        setTimeout(() => this.createPlotlyChart(), 100);
        return;
      } else {
        console.error('Chart container not available after maximum retries');
        this.error = 'Failed to initialize chart container';
        return;
      }
    }

    // Reset retry counter on success
    this.chartRetryCount = 0;

    // Safety check to prevent chart creation if component is being destroyed
    if (this.subscriptions.closed) {
      console.warn('Component is being destroyed, skipping chart creation');
      return;
    }

    const years = this.chartData.map(point => point.year);
    const rainfall = this.chartData.map(point => point.rainfall);
    const cornYield = this.chartData.map(point => point.cornYield);
    const soybeanYield = this.chartData.map(point => point.soybeanYield);
    const wheatYield = this.chartData.map(point => point.wheatYield);

    console.log('Chart data arrays:', {
      years,
      rainfall,
      cornYield,
      soybeanYield,
      wheatYield
    });

    const traces = [
      // Rainfall trace (left y-axis)
      {
        x: years,
        y: rainfall,
        name: 'Total Rainfall',
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        line: {
          color: '#1f77b4', // Dark blue - excellent contrast on white background
          width: 3
        },
        marker: {
          color: '#1f77b4',
          size: 6,
          line: {
            color: '#ffffff',
            width: 2
          }
        },
        yaxis: 'y',
        hovertemplate: '<b>Year:</b> %{x}<br><b>Total Rainfall:</b> %{y:.1f} mm<extra></extra>'
      },
      // Corn Yield trace (right y-axis)
      {
        x: years,
        y: cornYield,
        name: 'Total Corn Yield',
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        line: {
          color: '#ff7f0e', // Orange - high contrast on white background
          width: 3
        },
        marker: {
          color: '#ff7f0e',
          size: 6,
          line: {
            color: '#ffffff',
            width: 2
          }
        },
        yaxis: 'y2',
        hovertemplate: '<b>Year:</b> %{x}<br><b>Total Corn Yield:</b> %{y:.1f} bu/ac<extra></extra>'
      },
      // Soybean Yield trace (right y-axis)
      {
        x: years,
        y: soybeanYield,
        name: 'Total Soybean Yield',
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        line: {
          color: '#d62728', // Red - excellent contrast on white background
          width: 3
        },
        marker: {
          color: '#d62728',
          size: 6,
          line: {
            color: '#ffffff',
            width: 2
          }
        },
        yaxis: 'y2',
        hovertemplate: '<b>Year:</b> %{x}<br><b>Total Soybean Yield:</b> %{y:.1f} bu/ac<extra></extra>'
      },
      // Wheat Yield trace (right y-axis)
      {
        x: years,
        y: wheatYield,
        name: 'Total Wheat Yield',
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        line: {
          color: '#2ca02c', // Green - good contrast on white background
          width: 3
        },
        marker: {
          color: '#2ca02c',
          size: 6,
          line: {
            color: '#ffffff',
            width: 2
          }
        },
        yaxis: 'y2',
        hovertemplate: '<b>Year:</b> %{x}<br><b>Total Wheat Yield:</b> %{y:.1f} bu/ac<extra></extra>'
      }
    ];

    const layout = {
      title: {
        text: `Rainfall vs Crop Yields (${this.startYear} - ${this.endYear})`,
        font: {
          size: 18,
          color: '#2c3e50' // Dark text for visibility on white background
        }
      },
      autosize: true,
      width: window.innerWidth * 0.95,
      height: 600,
      showlegend: true,
      xaxis: {
        title: { 
          text: 'Year',
          font: { color: '#2c3e50' } // Dark text for visibility on white background
        },
        showgrid: false, // Remove vertical grid lines
        zeroline: false,
        tickmode: 'array' as const,
        tickvals: years,
        tickangle: -90,
        tickfont: {
          size: 10,
          color: '#2c3e50' // Dark text for visibility on white background
        },
        ticktext: years.map(year => year.toString())
      },
      yaxis: {
        title: { 
          text: 'Total Rainfall (mm)',
          font: { color: '#1f77b4' }
        },
        titlefont: { color: '#1f77b4' },
        tickfont: { color: '#1f77b4' },
        showgrid: true,
        gridcolor: '#e0e0e0', // Light grey grid lines visible on white background
        gridwidth: 1,
        zeroline: false,
        side: 'left' as const,
        domain: [0, 1]
      },
      yaxis2: {
        title: { 
          text: 'Total Yield (bu/ac)',
          font: { color: '#ff7f0e' }
        },
        titlefont: { color: '#ff7f0e' },
        tickfont: { color: '#ff7f0e' },
        showgrid: false,
        zeroline: false,
        side: 'right' as const,
        overlaying: 'y' as const,
        anchor: 'x',
        position: 1
      },
      legend: {
        x: 0.5,
        y: -0.15,
        xanchor: 'center',
        yanchor: 'top',
        orientation: 'h',
        bgcolor: 'rgba(255, 255, 255, 0.95)', // More opaque white background for better visibility
        bordercolor: '#ffffff',
        borderwidth: 1,
        font: { color: '#2E5A27' } // Dark text on light background for readability
      },
      hovermode: 'closest' as const,
      plot_bgcolor: 'rgba(0,0,0,0)', // Transparent background
      paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
      margin: {
        l: 80,
        r: 180, // Increased right margin to ensure right y-axis is fully visible
        t: 80,
        b: 150
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      useResizeHandler: true,
      autosize: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'rainfall-yield-chart',
        height: 600,
        width: 1200,
        scale: 1
      }
    };

    console.log('Creating Plotly chart with layout:', layout);
    console.log('Traces:', traces);

    Plotly.newPlot(this.chartContainer.nativeElement, traces, layout, config);
  }

  getTotalRainfall(): number {
    if (this.chartData.length === 0) return 0;
    const sum = this.chartData.reduce((acc, point) => acc + point.rainfall, 0);
    return sum / this.chartData.length;
  }

  getTotalCornYield(): number {
    if (this.chartData.length === 0) return 0;
    const cornYields = this.chartData.map(point => point.cornYield).filter(yieldValue => yieldValue > 0);
    if (cornYields.length === 0) return 0;
    const sum = cornYields.reduce((acc, yieldValue) => acc + yieldValue, 0);
    return sum / cornYields.length;
  }

  getTotalSoybeanYield(): number {
    if (this.chartData.length === 0) return 0;
    const soybeanYields = this.chartData.map(point => point.soybeanYield).filter(yieldValue => yieldValue > 0);
    if (soybeanYields.length === 0) return 0;
    const sum = soybeanYields.reduce((acc, yieldValue) => acc + yieldValue, 0);
    return sum / soybeanYields.length;
  }

  getTotalWheatYield(): number {
    if (this.chartData.length === 0) return 0;
    const wheatYields = this.chartData.map(point => point.wheatYield).filter(yieldValue => yieldValue > 0);
    if (wheatYields.length === 0) return 0;
    const sum = wheatYields.reduce((acc, yieldValue) => acc + yieldValue, 0);
    return sum / wheatYields.length;
  }

  getRainfallRange(): { min: number; max: number } {
    if (this.chartData.length === 0) return { min: 0, max: 0 };
    
    const rainfalls = this.chartData.map(point => point.rainfall);
    return {
      min: Math.min(...rainfalls),
      max: Math.max(...rainfalls)
    };
  }

  getYieldRange(): { min: number; max: number } {
    if (this.chartData.length === 0) return { min: 0, max: 0 };
    
    const allYields = [
      ...this.chartData.map(point => point.cornYield),
      ...this.chartData.map(point => point.soybeanYield),
      ...this.chartData.map(point => point.wheatYield)
    ].filter(yieldValue => yieldValue > 0); // Only consider non-zero yields
    
    if (allYields.length === 0) return { min: 0, max: 0 };
    
    return {
      min: Math.min(...allYields),
      max: Math.max(...allYields)
    };
  }

  downloadCSV(): void {
    if (this.chartData.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }

    // Create CSV content
    const headers = ['Year', 'Total Rainfall (mm)', 'Total Corn Yield (bu/ac)', 'Total Soybean Yield (bu/ac)', 'Total Wheat Yield (bu/ac)'];
    const rows = this.chartData.map(point => [
      point.year,
      point.rainfall.toFixed(1),
      point.cornYield.toFixed(1),
      point.soybeanYield.toFixed(1),
      point.wheatYield.toFixed(1)
    ]);

    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => row.join(',')).join('\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rainfall-yield-data-${this.startYear}-${this.endYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  downloadPNGTransparent(): void {
    if (!this.chartContainer || !this.chartContainer.nativeElement) {
      console.warn('Chart container not available for PNG download');
      return;
    }

    // Temporarily update legend background to transparent for PNG download
    const originalLegendBg = this.chartContainer.nativeElement.layout?.legend?.bgcolor;
    
    Plotly.relayout(this.chartContainer.nativeElement, {
      'legend.bgcolor': 'rgba(0,0,0,0)',
      'legend.bordercolor': 'rgba(0,0,0,0)',
      'legend.borderwidth': 0
    });

    // Use Plotly's downloadImage function for high-quality PNG with transparent background
    Plotly.downloadImage(this.chartContainer.nativeElement, {
      format: 'png',
      filename: `rainfall-yield-chart-transparent-${this.startYear}-${this.endYear}`,
      height: 800,
      width: 1200,
      scale: 4, // High DPI for crisp images
      imageDataOnly: true // This helps with transparency
    }).then(() => {
      // Restore original legend background after download
      if (originalLegendBg !== undefined) {
        Plotly.relayout(this.chartContainer.nativeElement, {
          'legend.bgcolor': originalLegendBg,
          'legend.bordercolor': '#ffffff',
          'legend.borderwidth': 1
        });
      }
    }).catch((error: any) => {
      console.error('Error downloading PNG:', error);
      // Restore original legend background even if download fails
      if (originalLegendBg !== undefined) {
        Plotly.relayout(this.chartContainer.nativeElement, {
          'legend.bgcolor': originalLegendBg,
          'legend.bordercolor': '#ffffff',
          'legend.borderwidth': 1
        });
      }
    });
  }

  downloadPNGWhite(): void {
    if (!this.chartContainer || !this.chartContainer.nativeElement) {
      console.warn('Chart container not available for PNG download');
      return;
    }

    // Temporarily update chart background to white and legend background to transparent
    const originalPlotBg = this.chartContainer.nativeElement.layout?.plot_bgcolor;
    const originalPaperBg = this.chartContainer.nativeElement.layout?.paper_bgcolor;
    const originalLegendBg = this.chartContainer.nativeElement.layout?.legend?.bgcolor;
    
    Plotly.relayout(this.chartContainer.nativeElement, {
      'plot_bgcolor': '#ffffff',
      'paper_bgcolor': '#ffffff',
      'legend.bgcolor': 'rgba(0,0,0,0)',
      'legend.bordercolor': 'rgba(0,0,0,0)',
      'legend.borderwidth': 0
    });

    // Use Plotly's downloadImage function for high-quality PNG with white background
    Plotly.downloadImage(this.chartContainer.nativeElement, {
      format: 'png',
      filename: `rainfall-yield-chart-white-${this.startYear}-${this.endYear}`,
      height: 800,
      width: 1200,
      scale: 4, // High DPI for crisp images
      imageDataOnly: false // This preserves the background
    }).then(() => {
      // Restore original backgrounds after download
      Plotly.relayout(this.chartContainer.nativeElement, {
        'plot_bgcolor': originalPlotBg,
        'paper_bgcolor': originalPaperBg,
        'legend.bgcolor': originalLegendBg,
        'legend.bordercolor': '#ffffff',
        'legend.borderwidth': 1
      });
    }).catch((error: any) => {
      console.error('Error downloading PNG:', error);
      // Restore original backgrounds even if download fails
      Plotly.relayout(this.chartContainer.nativeElement, {
        'plot_bgcolor': originalPlotBg,
        'paper_bgcolor': originalPaperBg,
        'legend.bgcolor': originalLegendBg,
        'legend.bordercolor': '#ffffff',
        'legend.borderwidth': 1
      });
    });
  }

  // Keep the original method for backward compatibility
  downloadPNG(): void {
    this.downloadPNGTransparent();
  }
} 