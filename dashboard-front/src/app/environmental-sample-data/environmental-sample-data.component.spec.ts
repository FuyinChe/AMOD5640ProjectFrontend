import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentalSampleDataComponent } from './environmental-sample-data.component';

describe('EnvironmentalSampleDataComponent', () => {
  let component: EnvironmentalSampleDataComponent;
  let fixture: ComponentFixture<EnvironmentalSampleDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvironmentalSampleDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvironmentalSampleDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
