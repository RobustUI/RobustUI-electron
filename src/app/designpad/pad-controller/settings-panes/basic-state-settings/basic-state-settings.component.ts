import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BasicState} from "../../../elements/basicState";
import {EventDispatcher, EventType} from "../../../eventDispatcher";

@Component({
  selector: 'app-basic-state-settings',
  templateUrl: './basic-state-settings.component.html',
  styleUrls: ['./basic-state-settings.component.scss']
})
export class BasicStateSettingsComponent implements OnInit, OnChanges {

  @Input()
  public set item(value: BasicState) {
    this._item = value;
    this.previousName = value.label;
    this.buildForm();
  }

  @Output()
  public close = new EventEmitter<boolean>();

  public form: FormGroup;

  private _item: BasicState;
  private previousName;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      label: ['', Validators.required]
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
      if (this._item.type === 'or' || this._item.type === 'basic') {
        this._item.label = this.form.controls.label.value;
        EventDispatcher.getInstance().emit({
          type: EventType.RENAME_STATE, data: {
            previousName: this.previousName,
            newState: this._item
          }
        });
      } else {
        this._item.name = this.form.controls.label.value;
      }
      this.close.emit(true);
    }
  }

  private buildForm(): void {
    if (this._item == null) {
      return;
    }

    this.form.controls.label.setValue(this._item.label);
  }
}
