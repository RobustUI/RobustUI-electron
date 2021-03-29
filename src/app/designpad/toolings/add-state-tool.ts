import {Tool} from "./tool";
import {Triple} from "../elements/triple";
import {Point} from "../elements/point";
import {BasicState} from "../elements/basicState";
import {EventDispatcher, EventType} from "../eventDispatcher";
import {ToolTypes} from "./toolTypes";

export class AddStateTool extends Tool {
  public readonly name: ToolTypes = 'AddStateTool';

  public mouseClicked(elements: any[], cameraPosition: Triple, mousePosition: Point): void {

    const xPos = (mousePosition.x / cameraPosition.z) - cameraPosition.x;
    const yPos = (mousePosition.y / cameraPosition.z) - cameraPosition.y;

    elements.push(new BasicState(this.p5, 'new state', xPos, yPos, 50));

    EventDispatcher.getInstance().emit({type: EventType.SWITCH_TOOL, data: 'SelectTool' as ToolTypes});
    EventDispatcher.getInstance().emit({type: EventType.CHANGE_COMPONENT, data: elements});

  }
}
