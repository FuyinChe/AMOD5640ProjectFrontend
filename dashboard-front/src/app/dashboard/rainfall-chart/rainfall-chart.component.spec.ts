import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RainfallChartComponent } from './rainfall-chart.component';

describe('RainfallChartComponent', () => {
  let component: RainfallChartComponent;
  let fixture: ComponentFixture<RainfallChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RainfallChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RainfallChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
