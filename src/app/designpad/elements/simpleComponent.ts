import {BasicState} from "./basicState";
import {Transition} from "./transition";
import * as P5 from "p5";
import {DoubleClickable} from "../interactions/p5Core";
import {Triple} from "./triple";
import {Event, EventDispatcher, EventType} from "../eventDispatcher";

export class SimpleComponent extends BasicState {

  public get getTransitions(): Transition[] {
    return this.transitions.slice();
  }

  public getStates(): BasicState[] {
    return this.subStates.slice();
  }

  private childrenDrawLevel: number;
  private defaultSize: number;
  private expandedWidth: number;
  private expandedHeight: number;

  constructor(
    pad: P5,
    title: string,
    private subStates: BasicState[],
    private transitions: Transition[],
    x: number,
    y: number,
    w: number
  ) {
    super(pad, title, x, y, w);
    this.defaultSize = w;
    this.childrenDrawLevel = this._drawLevel + 1;
    this.setDrawLevelAndCalculateExpandedDimensions();
    this.transitions.forEach(t => t.drawLevel = this.childrenDrawLevel);
    this._type = 'xor';
  }

  public draw(cameraPosition: Triple): void {
    super.draw(cameraPosition);
    if (this.shouldDrawChildren) {
      this.pad.push();
      this.pad.translate(this.xPos + 5, this.yPos + 5);
      if (this.constrainedDraw) {
        /*this.subStates.forEach(e => {
          e.position = {
            x: e.xPos / this.width,
            y: e.yPos / this.height,
            width: e.width / this.width
          };
        });*/
      }

      this.subStates.forEach(e => e.draw(cameraPosition));
      this.transitions.forEach(e => e.draw(cameraPosition));
      this.pad.pop();
    }
  }

  public update(cameraPosition: Triple, events: Event[]) {
    super.update(cameraPosition, events);
    this.setDimensionsAndDrawLevel(cameraPosition.z);
  }

  private setDimensionsAndDrawLevel(zoomLevel: number) {
    if (zoomLevel >= this.childrenDrawLevel && !this.shouldDrawChildren && this.constrainedDraw) {
      this.shouldDrawChildren = true;
    } else if (zoomLevel < this.childrenDrawLevel && this.shouldDrawChildren && this.constrainedDraw) {
      this.shouldDrawChildren = false;
    } else if (zoomLevel >= this.childrenDrawLevel && !this.shouldDrawChildren) {
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

    this.transitions.forEach((t) => {
      t.drawLevel = this.childrenDrawLevel;
    });

    this.subStates.forEach((e) => {
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
