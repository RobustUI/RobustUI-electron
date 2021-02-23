import {RobustUiComponent} from "./robust-ui-component";
import {Position} from "../interfaces/position";

export class RobustUiCompositeComponent extends RobustUiComponent {
  public components: Map<string, string>;
  constructor(
    label: string,
    type: number,
    inputs: Set<string>,
    outputs: Set<string>,
    positions: Map<string, Position>,
    components: Map<string, string>
  ) {
    super(label, type, inputs, outputs, positions);

    this.components = components;
  }


  public copy(): RobustUiComponent {
    return new RobustUiCompositeComponent(this.label, this.type, this.inputs, this.outputs, this.position, this.components);
  }

}
