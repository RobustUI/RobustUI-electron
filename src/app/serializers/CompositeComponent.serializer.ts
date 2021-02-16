                                                                                                                                                                                                                                                                  import {RobustUiSerializer} from "./SerializerFactory";
import {RobustUiComponent} from "../entities/robust-ui-component";
import {JsonRobustUIComponent} from "../interfaces/jsonRobustUIComponent";

export class CompositeComponentSerializer implements RobustUiSerializer{
  fromJson(json: JsonRobustUIComponent): RobustUiComponent {
    return undefined;
  }

  toJson(component: RobustUiComponent): string {
    return "";
  }

}
