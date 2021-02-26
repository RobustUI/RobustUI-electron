import {BasicState} from "./basicState";
import {Transition} from "./transition";
import * as P5 from "p5";
import {Triple} from "./triple";
import {Event, EventDispatcher, EventType} from "../eventDispatcher";

export class SimpleComponent extends BasicState {

  public get getTransitions(): Transition[] {
    return this.transitions.slice();
  }

  public getStates(): BasicState[] {
    return this.subStates.slice();
  }

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
      this.pad.textSize(this.pad.textSize() / this.childrenDrawLevel);
      this.pad.translate(this.xPos + 5, this.yPos + 5);
      if (this.constrainedDraw) {
        let maxWidth = 0;
        let minWidth = Infinity;
        let maxHeight = 0;
        let minHeight = Infinity;

        let maxX = 0;
        let minX = Infinity;
        let maxY = 0;
        let minY = Infinity;


        this.subStates.forEach((e) => {
          if (e.width > maxWidth) {
            maxWidth = e.width;
          }

          if (e.width < minWidth) {
            minWidth = e.width;
          }

          if (e.height > maxHeight) {
            maxHeight = e.height;
          }

          if (e.height < minHeight) {
            minHeight = e.height;
          }

          if (e.xPos > maxX) {
            maxX = e.xPos;
          }

          if (e.xPos < minX) {
            minX = e.xPos;
          }

          if (e.yPos > maxY) {
            maxY = e.yPos;
          }

          if (e.yPos < minY) {
            minY = e.yPos;
          }
        });

        this.subStates.forEach((e, index) => {
          let width;
          let height;
          let x;
          let y;


          if (maxWidth === minWidth) {
            width = 1 / this.subStates.length;
          } else {
            width = (e.width - minWidth) / (maxWidth - minWidth);
          }

          if (maxHeight === minHeight) {
            height = 1 / this.subStates.length;
          } else {
            height =  (e.height - minHeight) / (maxHeight - minHeight);
          }

          if (maxX === minX) {
            x = 1 / this.subStates.length;
          } else {
            x = (e.xPos - minX) / (maxX - minX);
          }

          if (maxY === minY) {
            y = 1 / this.subStates.length;
          } else {
            y =  (e.yPos - minY) / (maxY - minY);
          }

          width = (10 * width) + 5;
          height = (10 * height) + 5;
          x = ((this.width/this._drawLevel) * x) + 5;
          y = ((this.height/this._drawLevel) * y) + 5;

          e.constrainedDraw = true;
          e.constrainedDrawInfo = {
            x: x,
            y: y,
            width: width,
            height: height,
            drawLevel: this.childrenDrawLevel
          };
        });
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

  protected setDimensionsAndDrawLevel(zoomLevel: number): void {
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
