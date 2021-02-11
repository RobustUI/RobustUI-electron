import {Tool} from "./tool";
import {ToolTypes} from "./toolTypes";
import {Triple} from "../elements/triple";
import {implementsClickable, implementsSelectable} from "../implements";
import {Point} from "../elements/point";
import {BasicState} from "../elements/basicState";

export class ResizeStateTool extends Tool {
  readonly name: ToolTypes = 'ResizeStateTool';
  private cameraOffset: Point;
  private selected: BasicState;

  public mouseClicked(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    elements.filter((e) => implementsClickable(e)).forEach(e => e.clickEvent(cameraPosition));
    this.selected = elements.filter((e) => implementsSelectable(e)).find(e => e.selectEvent(cameraPosition));
    this.cameraOffset = {
      x: (cameraPosition.x * cameraPosition.z) - mouseCoordinates.x,
      y: (cameraPosition.y * cameraPosition.z) - mouseCoordinates.y
    };
  }

  public mouseDragged(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    const scale = (mouseCoordinates.x + this.cameraOffset.x) / cameraPosition.z;
    if (scale > 0) {
      this.selected.resize(scale);
    }
  }
}
