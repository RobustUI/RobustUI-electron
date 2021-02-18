import {RobustUiComponent} from "../entities/robust-ui-component";
import {SimpleComponentFactory} from "./SimpleComponent.factory";
import {CompositeComponentFactory} from "./CompositeComponent.factory";

export interface ComponentFactoryBuilder {
  build(label: string): RobustUiComponent;
}

export class ComponentFactory {
  public static forType(type: number): ComponentFactoryBuilder {
    switch (type) {
      case 1: return new SimpleComponentFactory();
      case 2: return new CompositeComponentFactory();

      default:
        throw new Error("Unknown type: " + type.toString());
    }
  }


}
