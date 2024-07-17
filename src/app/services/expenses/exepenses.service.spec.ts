import { TestBed } from '@angular/core/testing';

import { ExepensesService } from './exepenses.service';

describe('ExepensesService', () => {
  let service: ExepensesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExepensesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
