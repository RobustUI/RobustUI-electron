import {RobustUiState} from "../../entities/robust-ui-state";
import {BasicState} from "../elements/basicState";
import {Transition} from "../elements/transition";
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {RobustUiStateTypes} from "../../entities/robust-ui-state-types";
import {RobustUiTransition} from "../../entities/robust-ui-transition";

export class DesignPadToRobustUi {
  public static convert(elements: any[], base: RobustUiState): RobustUiComponent {
    const states = elements.filter(e => e instanceof BasicState);
    const transitions = elements.filter(e => e instanceof Transition);

    switch (base.type) {
      case RobustUiStateTypes.simpleComponent:
        return DesignPadToRobustUi.convertRobustUiSimpleComponent(states, transitions, base as RobustUiComponent);
      default:
        console.error("Couldn't convert");
        return undefined;
    }
  }

  private static convertRobustUiSimpleComponent(states: BasicState[], transitions: Transition[], base: RobustUiComponent): RobustUiComponent {

    const positions = new Map<string, {x:number, y:number}>();

    const robustUiStates = states.map(e => {
      positions.set(e.label, {x: e.xPos, y: e.yPos})
      return {
        label: e.label,
        type: RobustUiStateTypes.baseState
      } as RobustUiState;
    });

    const events = new Set<string>();

    const robustUiTransition = transitions.map(e => {
      const labelInputOutput = e.getEvent.slice(0,-1);
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
    
    return new RobustUiComponent(
      base.label,
      new Set(robustUiStates),
      base.initialState.label,
      events,
      base.inputs,
      base.outputs,
      new Set(robustUiTransition),
      positions
    );
  }
}
