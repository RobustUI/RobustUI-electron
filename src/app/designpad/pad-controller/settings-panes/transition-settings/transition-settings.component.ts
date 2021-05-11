import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
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

  public browserEvents: string[] = [
    "pointerenter",
    "pointerleave",
    "click"
  ];

  private _item: Transition;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      event: [''],
      type: ['BrowserEvent', Validators.required],
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
        case 'BrowserEvent':
          this._item.setEvent = this.form.controls.event.value.toString();
          break;
        case 'Compound':
          this._item.setEvent = this.form.controls.event.value.toString() + '/' + this.form.controls.outputEvent.value.toString() + '!';
      }
      this.close.emit(true);
    }
  }

  public isDisabled(): boolean {
    switch (this.form.controls.type.value) {
      case "BrowserEvent":
        return this.form.controls.event.value === "";
      case "Input":
        return this.form.controls.inputEvent.value === "";
      case "Output":
        return this.form.controls.outputEvent.value === "";
      case "Compound":
        return this.form.controls.event.value === "" || this.form.controls.outputEvent.value === "";
      default:
        return true;
    }
  }

  private buildForm(): void {
    if (this._item == null || this.outputEvents == null || this.inputEvents == null) {
      return;
    }

    this.resetForm();

    const inOutputLabel = this._item.getEvent.slice(0, -1);
    const isInput = this.inputEvents.has(inOutputLabel);
    const isOutput = this.outputEvents.has(inOutputLabel);

    const isCompound = this._item.getEvent.indexOf('/') != -1;
    if (isCompound) {
      this.form.controls.type.setValue('Compound');
      const labelSplit = this._item.getEvent.split('/');
      this.form.controls.event.setValue(labelSplit[0].trim());
      this.form.controls.outputEvent.setValue(labelSplit[1].trim().slice(0, -1));
    } else if (isInput) {
      this.form.controls.type.setValue('Input');
      this.form.controls.inputEvent.setValue(inOutputLabel);
    } else if (isOutput) {
      this.form.controls.type.setValue('Output');
      this.form.controls.outputEvent.setValue(inOutputLabel);

    } else {
      this.form.controls.type.setValue('BrowserEvent');
      this.form.controls.event.setValue(this._item.getEvent);
    }
  }

  private resetForm(): void {
    this.form.controls.event.setValue('');
    this.form.controls.outputEvent.setValue('');
    this.form.controls.inputEvent.setValue('');
  }
}
