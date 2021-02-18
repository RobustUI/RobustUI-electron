import {Component, EventEmitter, Output} from '@angular/core';
import {RobustUiStateTypes} from "../../entities/robust-ui-state-types";

@Component({
  selector: 'app-new-component-modal',
  templateUrl: './new-component-modal.component.html',
  styleUrls: ['./new-component-modal.component.scss']
})
export class NewComponentModalComponent {
  @Output()
  public newComponentName: EventEmitter<{name: string, type: number}> = new EventEmitter<{name: string, type: number}>();
  @Output()
  public closeModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  public createComponent(name: string, type: number): void {
    this.newComponentName.emit({ name, type });
  }

  public onCloseModal(): void {
    this.closeModal.emit(true);
  }
}
