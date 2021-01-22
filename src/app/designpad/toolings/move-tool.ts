import {Tool} from "./tool";
import {Point} from "../elements/point";
import {Triple} from "../elements/triple";
import {ToolTypes} from "./toolTypes";

export class MoveTool extends Tool {
  public readonly name: ToolTypes = 'MoveTool';
  private cameraOffset: Point;

  public mousePressed(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    this.cameraOffset = {
      x: (cameraPosition.x * cameraPosition.z) - mouseCoordinates.x,
      y: (cameraPosition.y * cameraPosition.z) - mouseCoordinates.y
    };
  }

  public mouseDragged(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    cameraPosition.x = (mouseCoordinates.x + this.cameraOffset.x) / cameraPosition.z;
    cameraPosition.y = (mouseCoordinates.y + this.cameraOffset.y) / cameraPosition.z;
  }
}
