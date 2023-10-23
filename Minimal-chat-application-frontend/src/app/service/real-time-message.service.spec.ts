import { TestBed } from '@angular/core/testing';

import { RealTimeMessageService } from './real-time-message.service';

describe('RealTimeMessageService', () => {
  let service: RealTimeMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealTimeMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
