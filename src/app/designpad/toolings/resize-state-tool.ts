import {Tool} from "./tool";
import {ToolTypes} from "./toolTypes";
import {Triple} from "../elements/triple";
import {implementsClickable, implementsDraggable, implementsOnReleased} from "../implements";
import {Point} from "../elements/point";
import {BasicState} from "../elements/basicState";
import {EventDispatcher, EventType} from "../eventDispatcher";

export class ResizeStateTool extends Tool {
  readonly name: ToolTypes = 'ResizeStateTool';
  private cameraOffset: Point;

  public mouseClicked(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    const test = elements.filter((e) => implementsClickable(e)).forEach(e => e.clickEvent(cameraPosition));
    this.cameraOffset = {
      x: (cameraPosition.x * cameraPosition.z) - mouseCoordinates.x,
      y: (cameraPosition.y * cameraPosition.z) - mouseCoordinates.y
    };
  }

  public mouseDragged(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    const x = (mouseCoordinates.x + this.cameraOffset.x) / cameraPosition.z;
    const test: BasicState = elements[1];
    if (x > 0) {
      test.resize(x);
    }
  }
}
