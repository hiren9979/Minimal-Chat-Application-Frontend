import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestlogComponent } from './requestlog.component';

describe('RequestlogComponent', () => {
  let component: RequestlogComponent;
  let fixture: ComponentFixture<RequestlogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestlogComponent]
    });
    fixture = TestBed.createComponent(RequestlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
