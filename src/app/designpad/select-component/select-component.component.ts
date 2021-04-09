import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ComponentRepository} from "../../componentRepository";
import {Observable, of} from "rxjs";
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {filter} from "rxjs/operators";
import {flatMap} from "rxjs/internal/operators";
import {BasicState} from "../elements/basicState";

@Component({
  selector: 'app-select-component',
  templateUrl: './select-component.component.html',
  styleUrls: ['./select-component.component.scss']
})
export class SelectComponentComponent {

  @Input()
  public show: boolean;

  @Input()
  public activeComp: RobustUiComponent;

  @Output()
  public showChange = new EventEmitter<boolean>();

  @Output()
  public selectedComponent = new EventEmitter<{name: string, type: string}>();

  public components$: Observable<RobustUiComponent[]>;
  constructor(private repo: ComponentRepository) {
    this.components$ = repo.getAll().pipe(flatMap((res) => {
      return of(res.filter(e => e.label !== this.activeComp.label));
    }));
  }

  public onCloseModal() {
    this.show = !this.show;
    this.showChange.emit(this.show);
  }

  public selectComponent(name: string, type: string) {
    if (name == null || type == null || name.trim().length <= 0 || type.trim().length <= 0) {
      return;
    }
    this.selectedComponent.emit({name, type});
    this.onCloseModal();
  }
}
