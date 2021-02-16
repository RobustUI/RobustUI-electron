import {RobustUiComponent} from "../entities/robust-ui-component";
import {SimpleComponentSerializer} from "./SimpleComponent.serializer";
import {CompositeComponentSerializer} from "./CompositeComponent.serializer";
import {JsonRobustUIComponent} from "../interfaces/jsonRobustUIComponent";
import {RobustUiStateTypes} from "../entities/robust-ui-state-types";

export interface RobustUiSerializer {
  fromJson(json: JsonRobustUIComponent): RobustUiComponent;
  toJson(component: RobustUiComponent): string;
}

export class SerializerFactory {
  public static forType(type: number): RobustUiSerializer {
    switch (type) {
      case 1: return new SimpleComponentSerializer();
      case 2: return new CompositeComponentSerializer();

      default:
        throw new Error("Unknown type: " + type.toString());
    }
  }


}
