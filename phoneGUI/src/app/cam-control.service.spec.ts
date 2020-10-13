import { TestBed } from '@angular/core/testing';

import { CamControlService } from './cam-control.service';

describe('CamControlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CamControlService = TestBed.get(CamControlService);
    expect(service).toBeTruthy();
  });
});
