import * as P5 from 'p5';
import {Clickable, OnPressed, OnReleased} from "./p5Core";
import {Point} from "../elements/point";
import {Triple} from "../elements/triple";

export abstract class Draggable implements Clickable, OnPressed, OnReleased {
  protected _isSelected = false;
  protected _isDragging = false;
  protected xOffset = 0;
  protected yOffset = 0;
  protected constructor() {
  }
  public abstract get xPos(): number;
  public abstract get yPos(): number;

  protected abstract isTarget(mouseX: number, mouseY: number, cameraPosition: Point): boolean;
  protected abstract move(xPos: number, yPos: number): void;
  protected abstract get p5(): P5;


  public clickEvent(cameraPosition: Triple): void {
    if (this.p5.keyIsDown(this.p5.CONTROL) && this.isTarget(this.p5.mouseX, this.p5.mouseY, cameraPosition)) {
      this.selected = true;
    } else if (!this.p5.keyIsDown(this.p5.CONTROL) && !this.isTarget(this.p5.mouseX, this.p5.mouseY, cameraPosition)) {
      this.selected = false;
    } else if (!this.p5.keyIsDown(this.p5.CONTROL) && this.isTarget(this.p5.mouseX, this.p5.mouseY, cameraPosition)) {
      this.selected = true;
    }
  }

  public pressedEvent(cameraPosition: Triple): void {
    this._isDragging = true;
    this.xOffset = this.xPos * cameraPosition.z - this.p5.mouseX;
    this.yOffset = this.yPos * cameraPosition.z - this.p5.mouseY;
  }

  public releasedEvent(): void {
    this._isDragging = false;
  }

  public dragEvent(cameraPosition: Triple): void {
    if (!this._isSelected) {
      return;
    }
    const xTarget = (this.p5.mouseX + this.xOffset) / cameraPosition.z;
    const yTarget = (this.p5.mouseY + this.yOffset) / cameraPosition.z;
    this.move(xTarget, yTarget);
  }

  protected set selected(value: boolean) {
    this._isSelected = value;
  }

  protected get isSelected(): boolean {
    return this._isSelected;
  }
}
