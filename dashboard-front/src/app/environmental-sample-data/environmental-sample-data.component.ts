import { Component,OnInit } from '@angular/core';
import {EnvironmentalSampleDataService} from '../environmental-sample-data.service';
import {NgForOf, NgIf, CommonModule, DecimalPipe} from '@angular/common';
import {RouterOutlet} from '@angular/router';

// Define the interface for an environmental sample data object
interface EnvironmentalSampleData {
  id: number;
  Timestamp: string;
  DOY: number | null;
  AirTemperature_degC: number | null;
  RelativeHumidity_Pct: number | null;
  ShortwaveRadiation_Wm2: number | null;
  Rainfall_mm: number | null;
  SoilTemperature_5cm_degC: number | null;
  SoilTemperature_20cm_degC: number | null;
  SoilTemperature_50cm_degC: number | null;
  WindSpeed_ms: number | null;
  WindVector_ms: number | null;
  WindDirection_deg: number | null;
  WindDirectionSD_deg: number | null;
  SnowDepth_m: number | null;
  LoggerTemperature_degC: number | null;
  LoggerVoltage_V: number | null;
  TotalPrecipitation_mV: number | null;
  TotalPrecipitation_mm: number | null;
  AtmosphericPressure_kPa: number | null;
  BatteryVoltage_V: number | null;
  MinutesOut_min: number | null;
  PanelTemp_degC: number | null;
  SnowDepth_cm: number | null;
  SolarRadiation_Wm2: number | null;
  SoilTemperature_10cm_degC: number | null;
  SoilTemperature_25cm_degC: number | null;
  Record_TCS_30min: number | null;
  LoggerTemp_degC: number | null;
  BarometricPressure_TCS_kPa: number | null;
  Year: number;
  Month: number;
  Day: number;
  Time: string;
}


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
  environmentalSampleData:any [] = [];
  constructor(private environmentalSampleDataService:EnvironmentalSampleDataService){}

  ngOnInit() {
    this.environmentalSampleDataService.getEnvironmentalData().subscribe({
      next: data => this.environmentalSampleData = data,
      error: err => console.error(err)
    });
  }
}
