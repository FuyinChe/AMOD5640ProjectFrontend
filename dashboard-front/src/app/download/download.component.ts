import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EnvironmentalSampleDataService } from '../services/environmental-sample-data.service';
import { EnvironmentalRecord } from '../interfaces/environmental-record';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-download',
  imports: [FormsModule, CommonModule],
  templateUrl: './download.component.html',
  styleUrl: './download.component.scss'
})
export class DownloadComponent implements OnInit {
  readonly STATIC_VARIABLES: string[] = [
    'DOY', 'AirTemperature_degC', 'RelativeHumidity_Pct', 'ShortwaveRadiation_Wm2', 'Rainfall_mm',
    'SoilTemperature_5cm_degC', 'SoilTemperature_20cm_degC', 'SoilTemperature_50cm_degC', 'WindSpeed_ms',
    'WindVector_ms', 'WindDirection_deg', 'WindDirectionSD_deg', 'SnowDepth_m', 'LoggerTemperature_degC',
    'LoggerVoltage_V', 'TotalPrecipitation_mV', 'TotalPrecipitation_mm', 'AtmosphericPressure_kPa',
    'BatteryVoltage_V', 'MinutesOut_min', 'PanelTemp_degC', 'SnowDepth_cm', 'SolarRadiation_Wm2',
    'SoilTemperature_10cm_degC', 'SoilTemperature_25cm_degC', 'Record_TCS_30min', 'LoggerTemp_degC',
    'BarometricPressure_TCS_kPa'
  ];
  data: EnvironmentalRecord[] = [];
  filteredData: EnvironmentalRecord[] = [];
  variables: string[] = this.STATIC_VARIABLES;
  selectedVariables: string[] = [];
  startDate: string = '';
  endDate: string = '';
  dropdownOpen = false;
  downloadDropdownOpen = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private sampleDataService: EnvironmentalSampleDataService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      // Store the intended destination before redirecting to login
      localStorage.setItem('intendedDestination', '/download');
      this.router.navigate(['/login']);
      return;
    }
    this.sampleDataService.getEnvironmentalData().subscribe(data => {
      this.data = data;
      this.filteredData = data;
    });
  }

  filterData() {
    this.filteredData = this.data.filter(record => {
      const recordDate = new Date(record.Timestamp);
      const afterStart = this.startDate ? recordDate >= new Date(this.startDate) : true;
      const beforeEnd = this.endDate ? recordDate <= new Date(this.endDate) : true;
      return afterStart && beforeEnd;
    });
  }

  downloadCSV() {
    if (!this.selectedVariables.length) return;
    const header = ['Timestamp', ...this.selectedVariables];
    const rows = [
      header,
      ...this.filteredData.map(record => [record.Timestamp, ...this.selectedVariables.map(v => record[v as keyof EnvironmentalRecord])])
    ];
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename with actual date range from filtered data
    let filename = 'trentfarmdata';
    if (this.filteredData.length > 0) {
      const dates = this.filteredData.map(record => new Date(record.Timestamp));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      const startDateFormatted = minDate.toISOString().split('T')[0].replace(/-/g, '');
      const endDateFormatted = maxDate.toISOString().split('T')[0].replace(/-/g, '');
      
      filename += `_${startDateFormatted}_${endDateFormatted}`;
    }
    filename += '.csv';
    
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadExcel() {
    if (!this.selectedVariables.length) return;
    const header = ['Timestamp', ...this.selectedVariables];
    const rows = this.filteredData.map(record => [record.Timestamp, ...this.selectedVariables.map(v => record[v as keyof EnvironmentalRecord])]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    let filename = 'trentfarmdata';
    if (this.filteredData.length > 0) {
      const dates = this.filteredData.map(record => new Date(record.Timestamp));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      const startDateFormatted = minDate.toISOString().split('T')[0].replace(/-/g, '');
      const endDateFormatted = maxDate.toISOString().split('T')[0].replace(/-/g, '');
      filename += `_${startDateFormatted}_${endDateFormatted}`;
    }
    filename += '.xlsx';
    const excelData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelData], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  allSelected(): boolean {
    return this.selectedVariables.length === this.variables.length && this.variables.length > 0;
  }

  toggleSelectAll(event: Event) {
    event.stopPropagation();
    if (this.allSelected()) {
      this.selectedVariables = [];
    } else {
      this.selectedVariables = [...this.variables];
    }
  }

  toggleVariable(variable: string, event?: Event) {
    if (event) event.stopPropagation();
    if (this.selectedVariables.includes(variable)) {
      this.selectedVariables = this.selectedVariables.filter(v => v !== variable);
    } else {
      this.selectedVariables = [...this.selectedVariables, variable];
    }
  }

  removeVariable(variable: string) {
    this.selectedVariables = this.selectedVariables.filter(v => v !== variable);
  }

  toggleDownloadDropdown(event: Event) {
    event.stopPropagation();
    this.downloadDropdownOpen = !this.downloadDropdownOpen;
  }

  closeDownloadDropdown() {
    this.downloadDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownElement = document.querySelector('.dropdown');
    if (this.dropdownOpen && dropdownElement && !dropdownElement.contains(target)) {
      this.dropdownOpen = false;
    }
    // Close download dropdown if click outside
    const downloadDropdownElement = document.querySelector('.download-dropdown');
    if (this.downloadDropdownOpen && downloadDropdownElement && !downloadDropdownElement.contains(target)) {
      this.downloadDropdownOpen = false;
    }
  }
}
