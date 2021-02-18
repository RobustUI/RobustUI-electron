import {RobustUiSerializer} from "./SerializerFactory";
import {RobustUiComponent} from "../entities/robust-ui-component";
import {JsonRobustUIComponent} from "../interfaces/jsonRobustUIComponent";
import {RobustUiCompositeComponent} from "../entities/robust-ui-composite-component";
import {Position} from "../interfaces/position";

export class CompositeComponentSerializer implements RobustUiSerializer{
  public fromJSON(json: JsonRobustUIComponent): RobustUiComponent {
    const newInput = new Set<string>();
    const newOutput = new Set<string>();
    const newPosition = new Map<string, Position>();
    const newComponents = new Map<string, string>();

    json.components.forEach(input => {
      newComponents.set(input.label, input.type);
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

    return new RobustUiCompositeComponent(
      json.label,
      json.type,
      newInput,
      newOutput,
      newPosition,
      newComponents
    );
  }

  public toJSON(component: RobustUiCompositeComponent): string {
    let inputs = "";
    let outputs = "";
    let positions = "";
    let components = "";

    component.components.forEach((component, key) => {
      components += `{
      "label": "${key}",
      "type": "${component}"
      },`;
    });

    component.position.forEach((position, key) => {
      positions += `{
      "label": "${key}",
      "x": ${position.x},
      "y": ${position.y},
      "width": ${position.width}
      },`;
    });

    component.inputs.forEach(input => {
      inputs += `"${input}",`;
    });
    component.outputs.forEach(output => {
      outputs += `"${output}",`;
    });
    components = components.slice(0, -1);
    inputs = inputs.slice(0, -1);
    outputs = outputs.slice(0, -1);
    positions = positions.slice(0, -1);

    return `{
      "label": "${component.label}",
      "type": ${component.type},
      "components": [
        ${components}
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
