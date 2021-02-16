import {RobustUiSerializer} from "./SerializerFactory";
import {RobustUiComponent} from "../entities/robust-ui-component";
import {RobustUiState} from "../entities/robust-ui-state";
import {RobustUiTransition} from "../entities/robust-ui-transition";
import {Position} from "../interfaces/position";
import {JsonRobustUIComponent} from "../interfaces/jsonRobustUIComponent";
import {RobustUiStateTypes} from "../entities/robust-ui-state-types";

export class SimpleComponentSerializer implements RobustUiSerializer {

  public fromStringToRobustUiStateTypesEnum(state: string): RobustUiStateTypes {
    switch (state) {
      case "0":
        return RobustUiStateTypes.baseState;
      case "1":
        return RobustUiStateTypes.simpleComponent;
      case "2":
        return RobustUiStateTypes.compositeComponent;
    }
  }

  public fromJson(json: JsonRobustUIComponent): RobustUiComponent {
    const newState = new Set<RobustUiState>();
    const newEvents = new Set<string>();
    const newInput = new Set<string>();
    const newOutput = new Set<string>();
    const newTransition = new Set<RobustUiTransition>();
    const newPosition = new Map<string, Position>();
    json.states.forEach(state => {
      newState.add({
        label: state.label,
        type: this.fromStringToRobustUiStateTypesEnum(state.type)
      });
    });

    json.events.forEach(event => {
      newEvents.add(event);
    });

    json.inputs.forEach(input => {
      newInput.add(input);
    });

    json.outputs.forEach(output => {
      newOutput.add(output);
    });

    json.transitions.forEach(transition => {
      newTransition.add(transition);
    });

    json.positions.forEach(position => {
      newPosition.set(position.label, {x: position.x, y: position.y, width: position.width});
    });

    return new RobustUiComponent(
      json.label,
      json.type,
      newState,
      json.initialState,
      newEvents,
      newInput,
      newOutput,
      newTransition,
      newPosition
    );
  }

  public toJson(component: RobustUiComponent): string {
    let states = "";
    let events = "";
    let inputs = "";
    let outputs = "";
    let transitions = "";
    let positions = "";
    component.states.forEach(state => {
      states += `{
      "label": "${state.label}",
      "type": "${state.type}"
      },`;
    });
    component.transitions.forEach(transition => {
      transitions += `{
      "from": "${transition.from}",
      "label": "${transition.label}",
      "to": "${transition.to}"
      },`;
    });
    component.positions.forEach((position, key) => {
      positions += `{
      "label": "${key}",
      "x": ${position.x},
      "y": ${position.y},
      "width": ${position.width}
      },`;
    });
    component.events.forEach(event => {
      events += `"${event}",`;
    });
    component.inputs.forEach(input => {
      inputs += `"${input}",`;
    });
    component.outputs.forEach(output => {
      outputs += `"${output}",`;
    });
    states = states.slice(0, -1);
    events = events.slice(0, -1);
    inputs = inputs.slice(0, -1);
    outputs = outputs.slice(0, -1);
    transitions = transitions.slice(0, -1);
    positions = positions.slice(0, -1);

    return `{
      "label": "${component.label}",
      "type": ${component.type},
      "initialState": "${component.initialState.label}",
      "states": [
        ${states}
      ],
      "events": [
        ${events}
      ],
      "inputs": [
        ${inputs}
      ],
      "outputs": [
        ${outputs}
      ],
      "transitions": [
       ${transitions}
      ],
      "positions": [
        ${positions}
      ]
    }`;
  }

}
