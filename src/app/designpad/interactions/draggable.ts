import * as P5 from 'p5';
import {Clickable, OnPressed, OnReleased} from "./p5Core";

export abstract class Draggable implements Clickable, OnPressed, OnReleased {
  protected _isSelected = false;
  protected _isDragging = false;
  protected xOffset = 0;
  protected yOffset = 0;

  protected constructor() {
  }

  protected abstract isTarget(mouseX: number, mouseY: number): boolean;
  protected abstract move(xPos: number, yPos: number): void;
  protected abstract get p5(): P5;
  protected abstract get xPos(): number;
  protected abstract get yPos(): number;

  public clickEvent(): void {
    if (this.p5.keyIsDown(this.p5.CONTROL) && this.isTarget(this.p5.mouseX, this.p5.mouseY)) {
      this.selected = true;
    } else if (!this.p5.keyIsDown(this.p5.CONTROL) && !this.isTarget(this.p5.mouseX, this.p5.mouseY)) {
      this.selected = false;
    } else if (!this.p5.keyIsDown(this.p5.CONTROL) && this.isTarget(this.p5.mouseX, this.p5.mouseY)) {
      this.selected = true;
    }
  }

  public pressedEvent(): void {
    this._isDragging = true;
    this.xOffset = this.xPos - this.p5.mouseX;
    this.yOffset = this.yPos - this.p5.mouseY;
  }

  public releasedEvent(): void {
    this._isDragging = false;
  }

  public dragEvent(): void {
    if (!this._isSelected) {
      return;
    }

    this.move(this.p5.mouseX + this.xOffset, this.p5.mouseY + this.yOffset);
  }

  protected set selected(value: boolean) {
    this._isSelected = value;
  }

  protected get isSelected(): boolean {
    return this._isSelected;
  }
}
