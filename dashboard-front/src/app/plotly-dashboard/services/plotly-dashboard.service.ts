import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlotlyDashboardService {

  constructor() { }

  /**
   * Get default chart colors for consistency across the dashboard
   */
  getChartColors(): string[] {
    return [
      '#00a085', // Humidity - Green
      '#0088cc', // Rainfall - Blue
      '#e67e22', // Soil Temperature - Orange
      '#0056b3', // Snow Depth - Dark Blue
      '#3498db', // Air Temperature - Light Blue
      '#2ecc71', // Wind Speed - Green
      '#9b59b6', // Solar Radiation - Purple
      '#e74c3c'  // Error/Alert - Red
    ];
  }

  /**
   * Get default chart layout configuration
   */
  getDefaultLayout(): any {
    return {
      font: {
        family: 'Museo Sans, sans-serif',
        size: 12,
        color: '#2c3e50'
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        l: 60,
        r: 40,
        t: 60,
        b: 60
      },
      hovermode: 'closest',
      showlegend: true
    };
  }

  /**
   * Get default chart configuration
   */
  getDefaultConfig(): any {
    return {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      toImageButtonOptions: {
        format: 'png',
        height: 500,
        width: 800,
        scale: 2
      }
    };
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Generate filename for chart export
   */
  generateFilename(chartType: string, startDate: string, endDate: string): string {
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');
    return `${chartType}_${start}_${end}`;
  }
} 