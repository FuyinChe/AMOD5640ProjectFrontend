import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CorrelationAnalysisService, CorrelationResponse } from '../../../services/correlation-analysis.service';
import { AuthService } from '../../../services/auth.service';

declare var Plotly: any;

@Component({
  selector: 'app-plotly-statistical-correlation-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plotly-statistical-correlation-chart.component.html',
  styleUrls: ['./plotly-statistical-correlation-chart.component.scss']
})
export class PlotlyStatisticalCorrelationChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() metrics?: string[];
  @Input() correlationMethod: 'pearson' | 'spearman' = 'pearson';
  @Input() activeView: 'matrix' | 'pairs' = 'matrix';

  chartData: any[] = [];
  chartLayout: any = {};
  chartConfig: any = {};
  isLoading = false;
  error: string | null = null;
  correlationData: CorrelationResponse | null = null;

  constructor(
    private correlationService: CorrelationAnalysisService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCorrelationData();
  }

  ngOnChanges(): void {
    if (this.correlationData) {
      this.createChart();
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', this.resizeChart.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeChart.bind(this));
  }

  resizeChart(): void {
    if (this.chartData.length > 0) {
      Plotly.Plots.resize('correlation-chart');
    }
  }

  loadCorrelationData(): void {
    // Check authentication before making request
    if (!this.authService.isLoggedIn()) {
      // Store intended destination and redirect to login
      localStorage.setItem('intendedDestination', '/plotly-dashboard');
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.correlationService.getCorrelationAnalysis(
      this.startDate,
      this.endDate,
      this.metrics,
      this.correlationMethod
    ).subscribe({
      next: (response) => {
        this.correlationData = response;
        this.createChart();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        
        // Handle authentication errors
        if (err.status === 401) {
          this.error = 'Authentication required. Please log in to view correlation data.';
          // Store intended destination and redirect to login
          localStorage.setItem('intendedDestination', '/plotly-dashboard');
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load correlation data';
          console.error('Correlation data error:', err);
        }
      }
    });
  }

  createChart(): void {
    if (!this.correlationData) return;

    if (this.activeView === 'matrix') {
      this.createCorrelationMatrix();
    } else {
      this.createPairwiseChart();
    }
  }

  createCorrelationMatrix(): void {
    if (!this.correlationData) return;
    
    const data = this.correlationData.data;
    const metricNames = data.metric_names;
    const correlationMatrix = data.correlation_matrix;

    // Create heatmap data
    const heatmapData = [{
      z: correlationMatrix,
      x: metricNames,
      y: metricNames,
      type: 'heatmap',
      colorscale: [
        [0, '#1f77b4'],    // Blue for negative correlations
        [0.25, '#7fb3d3'], // Light blue
        [0.5, '#f7f7f7'],  // Light gray for zero correlation
        [0.75, '#f4a582'], // Light orange
        [1, '#d62728']     // Red for positive correlations
      ],
      zmid: 0,
      hoverongaps: false,
      hovertemplate: 
        '<b>%{y} vs %{x}</b><br>' +
        'Correlation: %{z:.4f}<br>' +
        '<extra></extra>',
      showscale: true,
      colorbar: {
        title: {
          text: 'Correlation Coefficient',
          font: {
            size: this.isSmallScreen() ? 10 : 12,
            color: '#2c3e50',
            family: 'Arial, sans-serif'
          }
        },
        titleside: 'right',
        thickness: 20,
        len: 0.6,
        outlinewidth: 1,
        outlinecolor: '#bdc3c7',
        tickfont: {
          size: this.isSmallScreen() ? 8 : 10,
          color: '#2c3e50',
          family: 'Arial, sans-serif'
        },
        tickformat: '.3f'
      }
    }];

    const layout = {
      title: {
        text: `Correlation Matrix (${this.correlationMethod.charAt(0).toUpperCase() + this.correlationMethod.slice(1)})`,
        font: {
          size: this.isSmallScreen() ? 12 : 16,
          color: '#2c3e50',
          family: 'Arial, sans-serif'
        },
        x: 0.5,
        xanchor: 'center'
      },
      width: undefined,
      height: undefined,
      margin: {
        l: 150,
        r: 100,
        t: 70,
        b: 100
      },
      xaxis: {
        title: {
          text: 'Metrics',
          font: {
            size: this.isSmallScreen() ? 10 : 12,
            color: '#34495e'
          },
          standoff: 20
        },
        tickangle: -90,
        side: 'bottom',
        tickfont: {
          size: this.isSmallScreen() ? 7 : this.isMediumScreen() ? 8 : 10,
          color: '#7f8c8d'
        },
        automargin: true,
        tickmode: 'array',
        ticktext: metricNames.map(name => name.replace('_', ' ').toUpperCase()),
        tickvals: metricNames
      },
      yaxis: {
        autorange: 'reversed',
        tickfont: {
          size: this.isSmallScreen() ? 7 : this.isMediumScreen() ? 8 : 10,
          color: '#7f8c8d'
        },
        tickmode: 'array',
        ticktext: metricNames.map(name => name.replace('_', ' ').toUpperCase()),
        tickvals: metricNames,
        automargin: true,
        side: 'left',
        tickangle: 0
      },
      annotations: [] as any[],
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff'
    };

    // Add correlation values as text annotations
    for (let i = 0; i < metricNames.length; i++) {
      for (let j = 0; j < metricNames.length; j++) {
        const value = correlationMatrix[i][j];
        const pValue = data.p_value_matrix[i][j];
        const significance = pValue < 0.001 ? '***' : pValue < 0.01 ? '**' : pValue < 0.05 ? '*' : '';
        
        layout.annotations.push({
          x: j,
          y: i,
          text: `${value.toFixed(3)}${significance}`,
          showarrow: false,
          font: {
            color: Math.abs(value) > 0.6 ? 'white' : '#2c3e50',
            size: this.isSmallScreen() ? 8 : 9,
            family: 'Arial, sans-serif',
            weight: Math.abs(value) > 0.4 ? 'bold' : 'normal'
          }
        });
      }
    }

    this.chartData = heatmapData;
    this.chartLayout = layout;
    this.chartConfig = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      modeBarButtons: [
        ['toImage'],
        ['zoom2d'],
        ['resetScale2d']
      ],
      toImageButtonOptions: {
        format: 'png',
        filename: `correlation_matrix_${new Date().toISOString().split('T')[0]}`,
        height: 600,
        width: 800,
        scale: 2
      }
    };

    setTimeout(() => {
      Plotly.newPlot('correlation-chart', this.chartData, this.chartLayout, this.chartConfig);
    }, 100);
  }

  createPairwiseChart(): void {
    if (!this.correlationData) return;

    const pairwiseData = this.correlationData.data.pairwise_correlations;
    
    // Sort by absolute correlation value (strongest first)
    const sortedData = [...pairwiseData].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    // Take top 15 correlations for better visualization
    const topCorrelations = sortedData.slice(0, 15);

    const trace = {
      x: topCorrelations.map(item => `${item.metric1.replace('_', ' ').toUpperCase()} vs ${item.metric2.replace('_', ' ').toUpperCase()}`),
      y: topCorrelations.map(item => item.correlation),
      type: 'bar',
      marker: {
        color: topCorrelations.map(item => 
          item.correlation > 0 ? 'rgba(165, 0, 38, 0.8)' : 'rgba(49, 54, 149, 0.8)'
        ),
        line: {
          color: topCorrelations.map(item => 
            item.correlation > 0 ? 'rgb(165, 0, 38)' : 'rgb(49, 54, 149)'
          ),
          width: 1
        }
      },
      text: topCorrelations.map(item => 
        `r = ${item.correlation.toFixed(3)}<br>p = ${item.p_value.toExponential(2)}<br>n = ${item.sample_size}`
      ),
      textposition: 'outside',
      textfont: {
        size: this.isSmallScreen() ? 8 : 9,
        color: '#2c3e50',
        family: 'Arial, sans-serif'
      },
      hovertemplate: 
        '<b>%{x}</b><br>' +
        'Correlation: %{y:.4f}<br>' +
        'P-value: %{customdata[0]:.2e}<br>' +
        'Sample size: %{customdata[1]}<br>' +
        '<extra></extra>',
      customdata: topCorrelations.map(item => [item.p_value, item.sample_size])
    };

    const layout = {
      title: {
        text: `Top Pairwise Correlations (${this.correlationMethod.charAt(0).toUpperCase() + this.correlationMethod.slice(1)})`,
        font: {
          size: this.isSmallScreen() ? 12 : 16,
          color: '#2c3e50',
          family: 'Arial, sans-serif'
        },
        x: 0.5,
        xanchor: 'center'
      },
      width: undefined,
      height: undefined,
      margin: {
        l: 90,
        r: 90,
        t: 80,
        b: 180
      },
      xaxis: {
        title: {
          text: 'Metric Pairs',
          font: {
            size: this.isSmallScreen() ? 10 : 12,
            color: '#34495e'
          }
        },
        tickangle: -90,
        automargin: true,
        tickfont: {
          size: this.isSmallScreen() ? 7 : 9,
          color: '#7f8c8d'
        },
        tickmode: 'array'
      },
      yaxis: {
        title: {
          text: 'Correlation Coefficient',
          font: {
            size: this.isSmallScreen() ? 10 : 12,
            color: '#34495e'
          }
        },
        range: [-1, 1],
        tickfont: {
          size: this.isSmallScreen() ? 8 : 10,
          color: '#7f8c8d'
        }
      },
      showlegend: false,
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff'
    };

    this.chartData = [trace];
    this.chartLayout = layout;
    this.chartConfig = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      modeBarButtons: [
        ['toImage'],
        ['zoom2d'],
        ['resetScale2d']
      ],
      toImageButtonOptions: {
        format: 'png',
        filename: `pairwise_correlations_${new Date().toISOString().split('T')[0]}`,
        height: 600,
        width: 800,
        scale: 2
      }
    };

    setTimeout(() => {
      Plotly.newPlot('correlation-chart', this.chartData, this.chartLayout, this.chartConfig);
    }, 100);
  }



  isSmallScreen(): boolean {
    return window.innerWidth <= 600;
  }

  isMediumScreen(): boolean {
    return window.innerWidth <= 900;
  }

  downloadCSV(): void {
    if (!this.correlationData) return;

    let csvContent = '';
    
    if (this.activeView === 'matrix') {
      const data = this.correlationData.data;
      const metricNames = data.metric_names;
      const correlationMatrix = data.correlation_matrix;
      const pValueMatrix = data.p_value_matrix;

      // Header
      csvContent += 'Metric,' + metricNames.join(',') + '\n';
      
      // Correlation matrix
      csvContent += '\nCorrelation Matrix:\n';
      for (let i = 0; i < metricNames.length; i++) {
        csvContent += metricNames[i] + ',' + correlationMatrix[i].join(',') + '\n';
      }
      
      // P-value matrix
      csvContent += '\nP-Value Matrix:\n';
      for (let i = 0; i < metricNames.length; i++) {
        csvContent += metricNames[i] + ',' + pValueMatrix[i].join(',') + '\n';
      }
    } else {
      const pairwiseData = this.correlationData.data.pairwise_correlations;
      
      // Header
      csvContent += 'Metric1,Metric2,Correlation,P-Value,Sample Size\n';
      
      // Data
      pairwiseData.forEach(item => {
        csvContent += `${item.metric1},${item.metric2},${item.correlation},${item.p_value},${item.sample_size}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `correlation_analysis_${this.activeView}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPNG(): void {
    if (this.chartData.length > 0) {
      Plotly.downloadImage('correlation-chart', {
        format: 'png',
        filename: `correlation_analysis_${this.activeView}_${new Date().toISOString().split('T')[0]}`,
        height: 600,
        width: 800
      });
    }
  }
} 