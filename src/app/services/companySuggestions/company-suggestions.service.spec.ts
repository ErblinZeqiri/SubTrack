import { TestBed } from '@angular/core/testing';

import { CompanySuggestionsService } from './company-suggestions.service';

describe('CompanySuggestionsService', () => {
  let service: CompanySuggestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanySuggestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
