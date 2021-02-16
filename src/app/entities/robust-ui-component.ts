import {RobustUiState} from "./robust-ui-state";
import {RobustUiStateTypes} from "./robust-ui-state-types";
import {RobustUiTransition} from "./robust-ui-transition";
import {JsonRobustUIComponent} from "../interfaces/jsonRobustUIComponent";
import {Position} from "../interfaces/position";
import {SerializerFactory} from "../serializers/SerializerFactory";
import {RobustUiSimpleComponent} from "./robust-ui-simple-component";

export abstract class RobustUiComponent implements RobustUiState {
  public label: string;
  private _type: number;
  public inputs: Set<string>;
  public outputs: Set<string>;
  public position: Map<string, Position>;

  public get type(): RobustUiStateTypes {
    switch (this._type) {
      case 1:
        return RobustUiStateTypes.simpleComponent;
      case 2:
        return RobustUiStateTypes.compositeComponent;
      default:
        throw Error("Could not recognize the type");
    }
  }

  constructor(
    label: string,
    type: number,
    inputs: Set<string>,
    outputs: Set<string>,
    positions: Map<string, Position>
  ) {
    this.label = label;
    this.position = positions;
    this._type = type;
    this.inputs = inputs;
    this.outputs = outputs;
  }

  public abstract copy(): RobustUiComponent;

  public static factory(type: RobustUiStateTypes, label: string): RobustUiComponent {
    switch (type) {
      case RobustUiStateTypes.simpleComponent:
        return RobustUiSimpleComponent.factory(label);
      default:
        throw Error('Unknown type in RobustUiComponent factory, type=' + type.toString());
    }
  }

  public static toJSON(component: RobustUiComponent): string {
    return SerializerFactory.forType(component.type).toJson(component);
  }

  public static fromJSON(json: JsonRobustUIComponent): RobustUiComponent {
    return SerializerFactory.forType(json.type).fromJson(json);
  }
}
