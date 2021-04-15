import {RobustUiState} from "./robust-ui-state";
import {RobustUiStateTypes} from "./robust-ui-state-types";
import {Position} from "../interfaces/position";

export abstract class RobustUiComponent implements RobustUiState {
  public label: string;
  public initialCase: string;
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
      case 3:
        return RobustUiStateTypes.selectiveComponent;
      default:
        throw Error("Could not recognize the type");
    }
  }

  protected constructor(
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

    if (inputs != null && outputs != null) {
      if (!this.isMutuallyExclusive(inputs, outputs)) {
        throw new Error("Input-messages and Output-messages must be disjoint");
      }
    }
  }

  public abstract copy(): RobustUiComponent;

  protected isMutuallyExclusive(first: Set<string>, second: Set<string>): boolean {
    if (first.size === 0 && second.size === 0) {
      return true;
    }
    const intersection = Array.from(first).filter(x => second.has(x));

    return intersection.length === 0;
  }
}
