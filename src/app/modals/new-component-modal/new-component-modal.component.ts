import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-new-component-modal',
  templateUrl: './new-component-modal.component.html',
  styleUrls: ['./new-component-modal.component.scss']
})
export class NewComponentModalComponent {
  @Output()
  public newComponentName: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  public closeModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  public createComponent(name: string): void {
    this.newComponentName.emit(name);
  }

  public onCloseModal(): void {
    this.closeModal.emit(true);
  }
}
