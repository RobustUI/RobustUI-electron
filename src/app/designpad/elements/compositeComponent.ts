import {BasicState} from "./basicState";
import * as P5 from "p5";
import {Triple} from "./triple";
import {Event, EventDispatcher, EventType} from "../eventDispatcher";

export class CompositeComponent extends BasicState {

  private childrenDrawLevel: number;

  private defaultSize: number;
  private expandedWidth: number;
  private expandedHeight: number;
  private gridLayout: {rows: number, columns: number} = null;
  public get getComponent(): BasicState[] {
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
    this.gridLayout = this.getGridLayout();
  }

  public draw(cameraPosition: Triple): void {
    super.draw(cameraPosition);

    if (this.shouldDrawChildren) {
      this.drawGridLayout();
      this.drawChildrenInGrid(cameraPosition);
    }
  }

  public update(cameraPosition: Triple, events: Event[]) {
    super.update(cameraPosition, events);
    this.setDimensionsAndDrawLevel(cameraPosition.z);
    this.gridLayout = this.getGridLayout();
    this.subComponents.forEach(e => e.update(cameraPosition, events));
  }

  private drawChildrenInGrid(cameraPosition: Triple) {
    const padding = 5;
    const length = this.gridLayout.columns;
    const width = (this.width / this.gridLayout.columns) - (2 * padding);
    const height = (this.getRawHeight() / this.gridLayout.rows);
    Array.from(this.subComponents.entries()).forEach(([key, obj], index) => {
      const xFactor = Math.floor(index % length);
      const yFactor = Math.floor(index / length);

      this.pad.push();
      this.pad.textSize(this.pad.textSize() / this.childrenDrawLevel);
      this.pad.translate(this.xPos + (width * xFactor) + (xFactor * (2 * padding)) + padding, this.yPos + (height * yFactor)  + (yFactor * (2 * padding)) + padding);
      obj.position = {x: 0, y: 0, width: width, height: height, drawLevel: this.childrenDrawLevel};
      obj.constrainedDraw = true;
      obj.draw(cameraPosition);
      this.pad.pop();
    });
  }

  private drawGridLayout() {
    this.pad.push();
    this.pad.translate(this.xPos, this.yPos);
    this.pad.stroke('#c9c9c9c9');
    for (let i = 1; i < this.gridLayout.columns; i++) {
      this.pad.line((this.width/this.gridLayout.columns) * i, 0, (this.width/this.gridLayout.columns) * i, this.height);
    }

    for (let i = 1; i < this.gridLayout.rows; i++) {
      this.pad.line(0, (this.height/this.gridLayout.rows) * i, this.width, (this.height/this.gridLayout.rows) * i);
    }
    this.pad.pop();
  }

  private getGridLayout(): {rows: number, columns: number} {
    const n = this.subComponents.size;
    const r = Math.floor(Math.sqrt(n));
    let c = Math.floor(n/r);

    if (n != r*c) {
      c += 1;
    }

    return {rows: r, columns: c};
  }

  private setDimensionsAndDrawLevel(zoomLevel: number) {
    if (zoomLevel >= this.childrenDrawLevel && !this.shouldDrawChildren) {
      this.shouldDrawChildren = true;
      this.width = this.expandedWidth;
      this.height = this.expandedHeight;
      EventDispatcher.getInstance().emit({
        type: EventType.STATE_EXPANSION,
        data: {
          point: {x: this.xPos, y: this.yPos},
          old: {width: this.defaultSize, height: this.defaultSize},
          new: {width: this.expandedWidth, height: this.expandedHeight}
        }
      });
    } else if (zoomLevel < this.childrenDrawLevel && this.shouldDrawChildren) {
      this.shouldDrawChildren = false;
      this.width = this.defaultSize;
      this.height = this.defaultSize;
      EventDispatcher.getInstance().emit({
        type: EventType.STATE_SHRINK,
        data: {
          point: {x: this.xPos, y: this.yPos},
          old: {width: this.expandedWidth, height: this.expandedHeight},
          new: {width: this.defaultSize, height: this.defaultSize}
        }
      });
    }
  }

  protected setDrawLevelAndCalculateExpandedDimensions() {
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
