import { TestBed } from '@angular/core/testing';

import { EnvironmentalSampleDataService } from './environmental-sample-data.service';

describe('EnvironmentalSampleDataService', () => {
  let service: EnvironmentalSampleDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentalSampleDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
