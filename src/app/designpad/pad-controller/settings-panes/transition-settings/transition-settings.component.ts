import {Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {Transition} from "../../../elements/transition";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-transition-settings',
  templateUrl: './transition-settings.component.html',
  styleUrls: ['./transition-settings.component.scss']
})
export class TransitionSettingsComponent implements OnInit, OnChanges {
  @Input()
  public set item(value: Transition) {
    this._item = value;
    this.buildForm();
  }

  @Input()
  public inputEvents: Set<string>;

  @Input()
  public outputEvents: Set<string>;

  @Output()
  public close = new EventEmitter<boolean>();

  public form: FormGroup;

  private _item: Transition;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      event: [''],
      type: ['Internal', Validators.required],
      inputEvent: [''],
      outputEvent: ['']
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

      switch (this.form.controls.type.value) {
        case 'Input':
          this._item.setEvent = this.form.controls.inputEvent.value.toString() + '?';
          break;
        case 'Output':
          this._item.setEvent = this.form.controls.outputEvent.value.toString() + '!';
          break;
        case 'Internal':
          this._item.setEvent = this.form.controls.event.value.toString();
          break;
      }
      this.close.emit(true);
    }
  }

  private buildForm(): void {
    if (this._item == null || this.outputEvents == null || this.inputEvents == null) {
      return;
    }

    const inOutputLabel = this._item.getEvent.slice(0, -1);
    const isInput = this.inputEvents.has(inOutputLabel);
    const isOutput = this.outputEvents.has(inOutputLabel);

    if (isInput) {
      this.form.controls.type.setValue('Input');
      this.form.controls.inputEvent.setValue(inOutputLabel);

      this.form.controls.event.setValue('');
      this.form.controls.outputEvent.setValue('');
    } else if (isOutput) {
      this.form.controls.type.setValue('Output');
      this.form.controls.outputEvent.setValue(inOutputLabel);

      this.form.controls.event.setValue('');
      this.form.controls.inputEvent.setValue('');
    } else {
      this.form.controls.type.setValue('Internal');
      this.form.controls.event.setValue(this._item.getEvent);

      this.form.controls.inputEvent.setValue('');
      this.form.controls.outputEvent.setValue('');
    }


  }
}
