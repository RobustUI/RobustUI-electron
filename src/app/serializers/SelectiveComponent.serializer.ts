import {RobustUiSerializer} from "./SerializerFactory";
import {JsonRobustUIComponent} from "../interfaces/jsonRobustUIComponent";
import {Case, RobustUiSelectiveComponent} from "../entities/robust-ui-selective-component";
import {Position} from "../interfaces/position";

export class SelectiveComponentSerializer implements RobustUiSerializer {
  fromJSON(json: JsonRobustUIComponent): RobustUiSelectiveComponent {
    const newInput = new Set<string>();
    const newOutput = new Set<string>();
    const newPosition = new Map<string, Position>();
    const cases: Case[] = [];

    json.cases.forEach(e => {
      cases.push(e);
    });

    json.inputs.forEach(input => {
      newInput.add(input);
    });

    json.outputs.forEach(output => {
      newOutput.add(output);
    });

    json.positions.forEach(position => {
      newPosition.set(position.label, {x: position.x, y: position.y, width: position.width});
    });

    return new RobustUiSelectiveComponent(
      json.label,
      json.type,
      newInput,
      newOutput,
      newPosition,
      json.observer,
      cases
    );
  }

  toJSON(component: RobustUiSelectiveComponent): string {
    let inputs = "";
    let outputs = "";
    let positions = "";
    let cases = "";
    const observer = `{
      "input": "${component.observer.input}",
      "dataType": "${component.observer.dataType}"
    }`;

    component.position.forEach((position, key) => {
      positions += `{
      "label": "${key}",
      "x": ${position.x},
      "y": ${position.y},
      "width": ${position.width}
      },`;
    });

    component.cases.forEach((e) => {
      cases += `{
      "guard": "${e.guard}",
      "type": "${e.type}"
      },`;
    });

    component.inputs.forEach(input => {
      inputs += `"${input}",`;
    });
    component.outputs.forEach(output => {
      outputs += `"${output}",`;
    });

    cases = cases.slice(0, -1);
    inputs = inputs.slice(0, -1);
    outputs = outputs.slice(0, -1);
    positions = positions.slice(0, -1);

    return `{
      "label": "${component.label}",
      "type": ${component.type},
      "observer": ${observer},
      "cases": [
        ${cases}
      ],
      "inputs": [
        ${inputs}
      ],
      "outputs": [
        ${outputs}
      ],
      "positions": [
        ${positions}
      ]
    }`;
  }

}
