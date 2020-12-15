import {Component, Input, OnInit} from '@angular/core';
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-designpad',
  templateUrl: './designpad.component.html',
  styleUrls: ['./designpad.component.scss']
})
export class DesignpadComponent implements OnInit {
  @Input()
  public set component(value: RobustUiComponent) {
    this.componentSubject.next(value);
  }

  private componentSubject = new BehaviorSubject<RobustUiComponent>(null);
  public activeComponent: Observable<RobustUiComponent> = this.componentSubject.asObservable().pipe(tap(x => console.log(x)));
  constructor() { }

  ngOnInit(): void {

  }
}
