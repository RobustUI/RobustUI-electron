import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicStateSettingsComponent } from './basic-state-settings.component';

describe('BasicStateSettingsComponent', () => {
  let component: BasicStateSettingsComponent;
  let fixture: ComponentFixture<BasicStateSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicStateSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicStateSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
