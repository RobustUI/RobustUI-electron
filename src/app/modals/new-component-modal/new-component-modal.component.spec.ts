import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewComponentModalComponent } from './new-component-modal.component';

describe('NewComponentModalComponent', () => {
  let component: NewComponentModalComponent;
  let fixture: ComponentFixture<NewComponentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewComponentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewComponentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
