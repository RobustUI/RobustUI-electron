import {RobustUiComponent} from "../entities/robust-ui-component";
import {SimpleComponentSerializer} from "./SimpleComponent.serializer";
import {JsonRobustUIComponent} from "../interfaces/jsonRobustUIComponent";
import {CompositeComponentSerializer} from "./CompositeComponent.serializer";
import {SelectiveComponentSerializer} from "./SelectiveComponent.serializer";

export interface RobustUiSerializer {
  fromJSON(json: JsonRobustUIComponent): RobustUiComponent;
  toJSON(component: RobustUiComponent): string;
}

export class SerializerFactory {
  public static forType(type: number): RobustUiSerializer {
    switch (type) {
      case 1: return new SimpleComponentSerializer();
      case 2: return new CompositeComponentSerializer();
      case 3: return new SelectiveComponentSerializer();

      default:
        throw new Error("Unknown type: " + type.toString());
    }
  }


}
