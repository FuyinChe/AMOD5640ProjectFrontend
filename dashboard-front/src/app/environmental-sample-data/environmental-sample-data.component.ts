import { Component,OnInit } from '@angular/core';
import {EnvironmentalSampleDataService} from '../services/environmental-sample-data.service';
import {NgForOf, NgIf, CommonModule, DecimalPipe} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {EnvironmentalRecord} from '../interfaces/environmental-record';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-environmental-sample-data',
  imports: [
    // NgForOf,
    // NgIf,
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './environmental-sample-data.component.html',
  styleUrl: './environmental-sample-data.component.css'
})
export class EnvironmentalSampleDataComponent implements OnInit {
  environmentalSampleData:EnvironmentalRecord [] = [];
  constructor(private environmentalSampleDataService:EnvironmentalSampleDataService){}

  ngOnInit() {
    this.environmentalSampleDataService.getEnvironmentalData().subscribe({
      next: data => this.environmentalSampleData = data,
      error: err => console.error(err)
    });
  }

  downloadAsCSV() {
    const worksheet = XLSX.utils.json_to_sheet(this.environmentalSampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SampleData');
    const csvData = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'environmental-sample-data.csv');
  }

  downloadAsExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.environmentalSampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SampleData');
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelData], { type: 'application/octet-stream' });
    saveAs(blob, 'environmental-sample-data.xlsx');
  }
}
