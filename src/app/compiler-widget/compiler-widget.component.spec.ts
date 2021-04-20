import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompilerWidgetComponent } from './compiler-widget.component';

describe('CompilerWidgetComponent', () => {
  let component: CompilerWidgetComponent;
  let fixture: ComponentFixture<CompilerWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompilerWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompilerWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
