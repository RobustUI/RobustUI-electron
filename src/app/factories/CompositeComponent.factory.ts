import {ComponentFactoryBuilder} from "./ComponentFactory";
import {Position} from "../interfaces/position";
import {RobustUiCompositeComponent} from "../entities/robust-ui-composite-component";

export class CompositeComponentFactory implements ComponentFactoryBuilder{
  build(label: string): RobustUiCompositeComponent {
    return new RobustUiCompositeComponent(
      label,
      2,
      new Set(),
      new Set(),
      new Map<string,  Position>(),
      new Map<string, string>()
    );
  }

}
