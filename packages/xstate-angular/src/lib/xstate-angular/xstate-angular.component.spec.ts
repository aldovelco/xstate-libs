import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XstateAngularComponent } from './xstate-angular.component';

describe('XstateAngularComponent', () => {
  let component: XstateAngularComponent;
  let fixture: ComponentFixture<XstateAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XstateAngularComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XstateAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
