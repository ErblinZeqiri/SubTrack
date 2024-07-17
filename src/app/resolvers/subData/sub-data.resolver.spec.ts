import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { subDataResolver } from './sub-data.resolver';

describe('subDataResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => subDataResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
