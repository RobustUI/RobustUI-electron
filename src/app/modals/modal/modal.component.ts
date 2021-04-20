import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {EventDispatcher, EventType} from "../../designpad/eventDispatcher";
import {ClipboardService} from "ngx-clipboard";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy{
  @Input()
  public text: BehaviorSubject<string>;
  @Output()
  public openModel: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private _clipboardService: ClipboardService) {
  }

  public onCloseModel(): void {
    this.openModel.emit(false);
  }

  public copyToClipboard(){
    this._clipboardService.copy(this.text.value);
  }

  ngOnInit(): void {
    EventDispatcher.getInstance().emit({type: EventType.DISABLE_MOUSE_EVENTS, data: null});
  }

  ngOnDestroy(): void {
    EventDispatcher.getInstance().emit({type: EventType.ENABLE_MOUSE_EVENTS, data: null});
  }
}
