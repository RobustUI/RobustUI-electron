import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Transition} from "../../../elements/transition";

@Component({
  selector: 'app-guard-settings',
  templateUrl: './guard-settings.component.html',
  styleUrls: ['./guard-settings.component.scss']
})
export class GuardSettingsComponent implements OnInit, OnChanges  {

  @Input()
  public set item(value: Transition) {
    this._item = value;
    this.buildForm();
  }

  @Output()
  public close = new EventEmitter<boolean>();

  public form: FormGroup;

  private _item: Transition;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      guard: ['', Validators.required]
    });
  }

  public ngOnInit(): void {
    this.buildForm();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.buildForm();
  }

  public saveChanges(): void {
    if (this.form.valid) {
      this._item.setEvent = this.form.controls.guard.value;
      this.close.emit(true);
    }
  }

  private buildForm(): void {
    if (this._item == null) {
      return;
    }

    this.form.controls.guard.setValue(this._item.getEvent);
  }
}
