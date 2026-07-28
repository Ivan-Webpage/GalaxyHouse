import { TestBed } from '@angular/core/testing';

import { MakeMetaService } from './make-meta.service';

describe('MakeMetaService', () => {
  let service: MakeMetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MakeMetaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
