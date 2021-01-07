import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelCheckerComponent } from './model-checker.component';

describe('ModelCheckerComponent', () => {
  let component: ModelCheckerComponent;
  let fixture: ComponentFixture<ModelCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelCheckerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
