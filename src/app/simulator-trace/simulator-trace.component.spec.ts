import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorTraceComponent } from './simulator-trace.component';

describe('SimulatorTraceComponent', () => {
  let component: SimulatorTraceComponent;
  let fixture: ComponentFixture<SimulatorTraceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimulatorTraceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulatorTraceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
