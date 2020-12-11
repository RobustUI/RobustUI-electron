import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PadControllerComponent } from './pad-controller.component';

describe('PadControllerComponent', () => {
  let component: PadControllerComponent;
  let fixture: ComponentFixture<PadControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PadControllerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PadControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
