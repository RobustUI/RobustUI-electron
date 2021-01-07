import {Triple} from "../elements/triple";
import {Point} from "../elements/point";
import * as P5 from 'p5';

export abstract class Tool {
  public abstract readonly name: ToolTypes;
  constructor(protected p5: P5) {
  }

  public mouseClicked(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {}
  public mousePressed(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {}
  public mouseReleased(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {}
  public mouseDragged(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {}
  public doubleClicked(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {}
}
