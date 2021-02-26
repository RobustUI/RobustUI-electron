import {BasicState} from "./basicState";
import * as P5 from "p5";
import {Triple} from "./triple";
import {Event, EventDispatcher, EventType} from "../eventDispatcher";
import {GridBuilder} from "../pad-controller/helpers/GridBuilder";

export class CompositeComponent extends BasicState {
  public get getComponents(): BasicState[] {
    return Array.from(this.subComponents.values());
  }

  constructor(
    pad: P5,
    title: string,
    private subComponents: Map<string, BasicState>,
    x: number,
    y: number,
    w: number
  ) {
    super(pad, title, x, y, w);
    this.defaultSize = w;
    this.childrenDrawLevel = this._drawLevel + 1;
    this.setDrawLevelAndCalculateExpandedDimensions();
    this._type = 'and';
  }

  public draw(cameraPosition: Triple): void {
    super.draw(cameraPosition);

    if (this.shouldDrawChildren) {
      GridBuilder.drawGridLayout(this.pad, {x: this.xPos, y: this.yPos}, this.subComponents.size, this.width, this.height);
      GridBuilder.drawElementsInGrid(Array.from(this.subComponents.values()), this.width, this.getRawHeight(), {x: this.xPos, y: this.yPos}, this.pad, this.childrenDrawLevel, cameraPosition);
    }
  }

  public update(cameraPosition: Triple, events: Event[]) {
    super.update(cameraPosition, events);
    this.setDimensionsAndDrawLevel(cameraPosition.z);
    this.subComponents.forEach(e => e.update(cameraPosition, events));
  }

  protected setDrawLevelAndCalculateExpandedDimensions(): void {
    this.childrenDrawLevel = this._drawLevel + 1;
    let maxWidth = 0;
    let maxHeight = 0;
    let minX = Infinity;
    let maxX = 0;
    let minY = Infinity;
    let maxY = 0;
    this.subComponents.forEach((e) => {
      e.drawLevel = this.childrenDrawLevel;

      if (e.xPos < minX) {
        minX = e.xPos;
      }

      if (e.xPos > maxX) {
        maxX = e.xPos;
        maxWidth = e.width;
      }

      if (e.yPos < minY) {
        minY = e.yPos;
      }

      if (e.yPos > maxY) {
        maxY = e.yPos;
        maxHeight = e.height;
      }
    });
    this.expandedWidth = 10 + maxX-minX + maxWidth + minX;
    this.expandedHeight = 10 + maxY-minY + maxHeight + minY;
  }
}
