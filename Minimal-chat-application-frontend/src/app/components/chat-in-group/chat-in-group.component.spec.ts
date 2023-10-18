import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInGroupComponent } from './chat-in-group.component';

describe('ChatInGroupComponent', () => {
  let component: ChatInGroupComponent;
  let fixture: ComponentFixture<ChatInGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatInGroupComponent]
    });
    fixture = TestBed.createComponent(ChatInGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
