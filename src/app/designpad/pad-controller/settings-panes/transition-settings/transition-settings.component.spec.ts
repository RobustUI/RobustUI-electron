import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitionSettingsComponent } from './transition-settings.component';

describe('TransitionSettingsComponent', () => {
  let component: TransitionSettingsComponent;
  let fixture: ComponentFixture<TransitionSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransitionSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransitionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
