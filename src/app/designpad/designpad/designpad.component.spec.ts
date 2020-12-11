import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignpadComponent } from './designpad.component';

describe('DesignpadComponent', () => {
  let component: DesignpadComponent;
  let fixture: ComponentFixture<DesignpadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesignpadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignpadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
