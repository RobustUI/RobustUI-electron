import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardSettingsComponent } from './guard-settings.component';

describe('GuardSettingsComponent', () => {
  let component: GuardSettingsComponent;
  let fixture: ComponentFixture<GuardSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuardSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuardSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
