import {RobustUiSimpleComponent} from "../entities/robust-ui-simple-component";
import {RobustUiState} from "../entities/robust-ui-state";
import {RobustUiStateTypes} from "../entities/robust-ui-state-types";
import {Position} from "../interfaces/position";
import {ComponentFactoryBuilder} from "./ComponentFactory";

export class SimpleComponentFactory implements ComponentFactoryBuilder {
  public build(label: string): RobustUiSimpleComponent {
    const initialStateLabel = "initial_state";
    const initialState: RobustUiState = {
      label: initialStateLabel,
      type: RobustUiStateTypes.baseState
    };
    const newState = new Set<RobustUiState>();
    const position = new Map<string, Position>();
    newState.add(initialState);
    position.set(initialStateLabel, {x: 10, y: 10, width: 50});
    return new RobustUiSimpleComponent(label, 1, newState, initialState.label, new Set(), new Set(), new Set(), new Set(), position);
  }

}
