import {ComponentFactoryBuilder} from "./ComponentFactory";
import {RobustUiSelectiveComponent} from "../entities/robust-ui-selective-component";
import {Position} from "../interfaces/position";

export class SelectiveComponentFactory implements ComponentFactoryBuilder {
  public build(label: string): RobustUiSelectiveComponent {
    const inputs = new Set<string>();
    inputs.add('stream');
    return new RobustUiSelectiveComponent(
      label,
      3,
      inputs,
      new Set(),
      new Map<string, Position>(),
      {
        input: 'stream',
        dataType: 'number'
      },
      []
    );
  }

}
