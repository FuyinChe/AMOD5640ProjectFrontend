import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnowDepthChartComponent } from './snow-depth-chart.component';

describe('SnowDepthChartComponent', () => {
  let component: SnowDepthChartComponent;
  let fixture: ComponentFixture<SnowDepthChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnowDepthChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnowDepthChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
