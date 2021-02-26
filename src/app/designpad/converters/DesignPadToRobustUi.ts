import {RobustUiState} from "../../entities/robust-ui-state";
import {BasicState} from "../elements/basicState";
import {Transition} from "../elements/transition";
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {RobustUiStateTypes} from "../../entities/robust-ui-state-types";
import {RobustUiTransition} from "../../entities/robust-ui-transition";
import {Position} from "../../interfaces/position";
import {RobustUiSimpleComponent} from "../../entities/robust-ui-simple-component";
import {RobustUiCompositeComponent} from "../../entities/robust-ui-composite-component";
import {RobustUiSelectiveComponent} from "../../entities/robust-ui-selective-component";

export class DesignPadToRobustUi {
  public static convert(elements: any[], base: RobustUiState): RobustUiComponent {
    const states = elements.filter(e => e instanceof BasicState);
    const transitions = elements.filter(e => e instanceof Transition);

    switch (base.type) {
      case RobustUiStateTypes.simpleComponent:
        return DesignPadToRobustUi.convertRobustUiSimpleComponent(states, transitions, base as RobustUiSimpleComponent);
      case RobustUiStateTypes.compositeComponent:
        return DesignPadToRobustUi.convertRobustUiCompositeComponent(states, base as RobustUiCompositeComponent);
      case RobustUiStateTypes.selectiveComponent:
        return DesignPadToRobustUi.convertRobustUiSelectiveComponent(states, transitions, base as RobustUiSelectiveComponent);
      default:
        throw Error("Couldn't convert to Data Structure");
    }
  }

  private static convertRobustUiSimpleComponent(states: BasicState[], transitions: Transition[], base: RobustUiSimpleComponent): RobustUiComponent {

    const positions = new Map<string, Position>();

    const robustUiStates = states.map(e => {
      positions.set(e.label, {x: e.xPos, y: e.yPos, width: e.width});
      return {
        label: e.label,
        type: RobustUiStateTypes.baseState
      } as RobustUiState;
    });

    const events = new Set<string>();

    const robustUiTransition = transitions.map(e => {
      const labelInputOutput = e.getEvent.slice(0, -1);
      let label = e.getEvent;

      if (base.outputs.has(labelInputOutput) || base.inputs.has(labelInputOutput)) {
        label = labelInputOutput;
      } else {
        events.add(label);
      }

      return {
        label: label,
        from: e.getFrom.label,
        to: e.getTo.label
      } as RobustUiTransition;
    });

    return new RobustUiSimpleComponent(
      base.label,
      base.type,
      new Set(robustUiStates),
      base.initialState.label,
      events,
      base.inputs,
      base.outputs,
      new Set(robustUiTransition),
      positions
    );
  }

  private static convertRobustUiCompositeComponent(components: BasicState[], base: RobustUiCompositeComponent) {
    const positions = new Map<string, Position>();
    const robustUiComponents = new Map<string, string>();

    components.map(e => {
      positions.set(e.label, {x: e.xPos, y: e.yPos, width: e.width});
      robustUiComponents.set(e.label, e.identifier);
    });


    return new RobustUiCompositeComponent(
      base.label,
      base.type,
      base.inputs,
      base.outputs,
      positions,
      robustUiComponents
    );
  }

  private static convertRobustUiSelectiveComponent(states: BasicState[], transitions: Transition[], base: RobustUiSelectiveComponent): RobustUiSelectiveComponent {
    const positions = new Map<string, Position>();
    const cases = [];



    states.filter(e => !e.isInitial).map(e => {
      positions.set(e.label, {x: e.xPos, y: e.yPos, width: e.width});
      const guard = transitions.find(t => t.getTo === e).getEvent;
      cases.push({
        guard: guard,
        type: e.identifier
      });
    });

    return new RobustUiSelectiveComponent(
      base.label,
      base.type,
      base.inputs,
      base.outputs,
      positions,
      base.observer,
      cases
    );
  }
}
