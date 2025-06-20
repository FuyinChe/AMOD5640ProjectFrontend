import { TestBed } from '@angular/core/testing';

import { EnvironmentalDataService } from './environmental-data.service';

describe('EnvironmentalDataService', () => {
  let service: EnvironmentalDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentalDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
