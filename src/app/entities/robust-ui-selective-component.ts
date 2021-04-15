import {RobustUiComponent} from "./robust-ui-component";
import {Position} from "../interfaces/position";

export interface ObserverData {
  input: string;
  dataType: string;
}

export interface Case {
  guard: string;
  label: string;
  type: string;
}

export class RobustUiSelectiveComponent extends RobustUiComponent {
  public observer: ObserverData;
  public cases: Case[];

  constructor(
    label: string,
    type: number,
    initialCase: string,
    inputs: Set<string>,
    outputs: Set<string>,
    positions: Map<string, Position>,
    observer: ObserverData,
    cases: Case[]
  ) {
    super(label, type, inputs, outputs, positions);
    this.observer = observer;
    this.cases = cases;
    this.initialCase = initialCase;
  }

  public copy(): RobustUiComponent {
    return new RobustUiSelectiveComponent(this.label, this.type, this.initialCase, this.inputs, this.outputs, this.position, this.observer, this.cases);
  }
}
