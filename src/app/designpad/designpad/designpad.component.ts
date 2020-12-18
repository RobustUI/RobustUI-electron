import {Component, Input, OnInit} from '@angular/core';
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {Subject} from "rxjs";

@Component({
  selector: 'app-designpad',
  templateUrl: './designpad.component.html',
  styleUrls: ['./designpad.component.scss']
})
export class DesignpadComponent implements OnInit {
  @Input()
  public set component(value: RobustUiComponent) {
    this.activeComponent = value;
  }

  @Input()
  public addComponentStream: Subject<RobustUiComponent>;

  public activeComponent: RobustUiComponent;
  constructor() { }

  public ngOnInit(): void {
    this.addComponentStream.subscribe((newComp: RobustUiComponent) => {
      this.activeComponent.states.set(newComp.label, newComp);
    });
  }
}
