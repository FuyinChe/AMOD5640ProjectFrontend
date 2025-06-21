import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoilTemp5cmChartComponent } from './soil-temp5cm-chart.component';

describe('SoilTemp5cmChartComponent', () => {
  let component: SoilTemp5cmChartComponent;
  let fixture: ComponentFixture<SoilTemp5cmChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoilTemp5cmChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoilTemp5cmChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
