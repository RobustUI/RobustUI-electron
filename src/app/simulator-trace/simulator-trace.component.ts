import {Component, Input} from '@angular/core';
import {SimulatorTrace} from "../interfaces/simulator-trace";

@Component({
  selector: 'app-simulator-trace',
  templateUrl: './simulator-trace.component.html',
  styleUrls: ['./simulator-trace.component.scss']
})
export class SimulatorTraceComponent {
  public traces: SimulatorTrace[] = [];

  @Input()
  public set simulatorTrances(value: SimulatorTrace) {
    if (value != null) {
      this.traces.push(value);
    }
    console.log(this.traces);
  }

  constructor() {
  }
}
