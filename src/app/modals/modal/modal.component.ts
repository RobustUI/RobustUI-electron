import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input()
  public text: BehaviorSubject<string>;
  @Output()
  public openModel: EventEmitter<boolean> = new EventEmitter<boolean>();

  public onCloseModel(): void {
    this.openModel.emit(false);
  }
}
