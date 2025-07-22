import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EnvironmentalDataService } from '../services/environmental-data.service';
import { EnvironmentalRecord } from '../interfaces/environmental-record';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DownloadService } from '../services/download.service';

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
  variables: string[] = this.STATIC_VARIABLES;
  selectedVariables: string[] = [];
  startDate: string = '2023-01-01';
  endDate: string = '2023-12-31';
  dropdownOpen = false;
  downloadDropdownOpen = false;
  filterApplied = false;
  appliedVariables: string[] = [];
  appliedStartDate: string = '';
  appliedEndDate: string = '';

  private formatDate(date: string): string {
    if (!date) return '';
    // Remove any single quotes
    date = date.replace(/'/g, '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  constructor(
    public auth: AuthService,
    private router: Router,
    private downloadService: DownloadService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      localStorage.setItem('intendedDestination', '/download');
      this.router.navigate(['/login']);
      return;
    }
    // No data fetching on init
  }

  // UI logic for variable selection and dropdowns remains unchanged

  onApply() {
    this.filterApplied = true;
    this.appliedVariables = [...this.selectedVariables];
    this.appliedStartDate = this.startDate;
    this.appliedEndDate = this.endDate;
  }

  downloadCSV() {
    if (!this.appliedVariables.length) return;
    const startDate = this.formatDate(this.appliedStartDate) || '2023-01-01';
    const endDate = this.formatDate(this.appliedEndDate) || '2023-12-31';
    this.downloadService.downloadEnvironmentalData(startDate, endDate, this.appliedVariables)
      .subscribe(jsonData => {
        if (!jsonData || !jsonData.length) return;
        const header = Object.keys(jsonData[0]);
        const rows = [header, ...jsonData.map(row => header.map(h => row[h]))];
        const csvContent = rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        let filename = 'trentfarmdata';
        filename += `_${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}.csv`;
        saveAs(blob, filename);
      });
  }

  downloadExcel() {
    if (!this.appliedVariables.length) return;
    const startDate = this.formatDate(this.appliedStartDate) || '2023-01-01';
    const endDate = this.formatDate(this.appliedEndDate) || '2023-12-31';
    this.downloadService.downloadEnvironmentalData(startDate, endDate, this.appliedVariables)
      .subscribe(jsonData => {
        if (!jsonData || !jsonData.length) return;
        const header = Object.keys(jsonData[0]);
        const rows = jsonData.map(row => header.map(h => row[h]));
        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        let filename = 'trentfarmdata';
        filename += `_${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}.xlsx`;
        const excelData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelData], { type: 'application/octet-stream' });
        saveAs(blob, filename);
      });
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
    this.filterApplied = false;
  }

  toggleVariable(variable: string, event?: Event) {
    if (event) event.stopPropagation();
    if (this.selectedVariables.includes(variable)) {
      this.selectedVariables = this.selectedVariables.filter(v => v !== variable);
    } else {
      this.selectedVariables = [...this.selectedVariables, variable];
    }
    this.filterApplied = false;
  }

  removeVariable(variable: string) {
    this.selectedVariables = this.selectedVariables.filter(v => v !== variable);
    this.filterApplied = false;
  }

  toggleDownloadDropdown(event: Event) {
    event.stopPropagation();
    this.downloadDropdownOpen = !this.downloadDropdownOpen;
  }

  closeDownloadDropdown() {
    this.downloadDropdownOpen = false;
  }

  setStartDate(date: string) {
    this.startDate = date;
    this.filterApplied = false;
  }

  setEndDate(date: string) {
    this.endDate = date;
    this.filterApplied = false;
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
