import * as P5 from 'p5';
import {Draggable} from "../interactions/draggable";
import {DoubleClickable, Drawable, Updatable} from "../interactions/p5Core";
import {Point} from "./point";
import {Triple} from "./triple";
import {Event, EventDispatcher, EventType} from "../eventDispatcher";

export class BasicState extends Draggable implements Drawable, Updatable, DoubleClickable {
  public get xPos(): number {
    return this.x / this._drawLevel;
  }

  public get yPos(): number {
    return this.y / this._drawLevel;
  }

  public get width(): number {
    return this.w / this._drawLevel;
  }

  public set width(value: number) {
    this.w = value;
  }

  public get height(): number {
    if (this.shouldDrawChildren) {
      return (this.h + this.snackbarHeight) / this._drawLevel;
    } else {
      return this.h / this._drawLevel;
    }
  }

  public set height(value: number) {
    this.h = value;
  }

  public getRawHeight() : number {
    return this.h / this._drawLevel;
  }

  public get label(): string {
    return (this._name != null) ? this._name : this.title;
  }

  public set label(value: string) {
    this.title = value;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get identifier(): string {
    return this.title;
  }

  public set position (value: { x: number, y: number, width: number, height: number, drawLevel: number}) {
    const height = (this.shouldDrawChildren) ? (value.height * value.drawLevel) - (this.snackbarHeight * value.drawLevel) : value.height * value.drawLevel;
    const width = value.width * value.drawLevel;
    const x = value.x;
    const y = (this.shouldDrawChildren) ? value.y + ((this.snackbarHeight * value.drawLevel)) : value.y;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public constrainedDraw = false;
  public constrainedDrawInfo: { x: number, y: number, width: number, height: number, drawLevel: number} = null;

  protected _type = 'basic';
  protected _drawLevel = 1;

  public set drawLevel(drawLevel: number) {
    this._drawLevel = drawLevel;
    this.setDrawLevelAndCalculateExpandedDimensions();
  }

  public get type() {
    return this._type;
  }

  public get isInitial() {
    return this._isInitial;
  }

  public set isInitial(value: boolean) {
    this._isInitial = value;
  }

  public translateScaleForMouseInteraction: Point = {x:0, y:0};

  protected get p5(): P5 {
    return this.pad;
  }

  protected setDrawLevelAndCalculateExpandedDimensions() {

  }

  private get snackbarHeight() {
    return this._snackbarHeight / this._drawLevel;
  }

  private set snackbarHeight(value: number) {
    this._snackbarHeight = value;
  }

  protected childrenDrawLevel: number;
  protected defaultSize: number;

  protected expandedWidth: number;
  protected expandedHeight: number;

  private _isHover = false;

  private w: number;
  private h: number;

  private _isInitial: boolean;
  private _name: string = null;

  protected shouldDrawChildren = false;
  private _snackbarHeight = 20;
  private defaultPadding = 5;

  constructor(protected pad: P5, private title: string, private x: number, private y: number, w: number, isInitial = false) {
    super();
    this.w = w;
    this.h = w;
    this._isInitial = isInitial;
  }

  public draw(cameraPosition: Triple): void {
    this._drawState();
    this._drawLabel();
  }

  public resize(scale: number): void {
    this.height = scale;
    this.width = scale;
  }

  public update(cameraPosition: Triple, events: Event[]): void {
    events.forEach(e => this.handleEvent(e));
    this._isHover = this.isTarget(this.pad.mouseX, this.pad.mouseY, cameraPosition);
  }

  public selectEvent(cameraPosition: Triple): boolean {
    return this.isTarget(this.pad.mouseX, this.pad.mouseY, cameraPosition);
  }

  public doubleClickEvent(cameraPosition: Triple): boolean {
    return this.isTarget(this.pad.mouseX, this.pad.mouseY, cameraPosition);
  }

  public getCenterOfEdge(side: 't' | 'r' | 'b' | 'l', cameraPosition: Triple): Point {
    let xEdgeCenter;
    let yEdgeCenter;

    if (side === 't') {
      xEdgeCenter = (this.constrainedDrawInfo) ? this.constrainedDrawInfo.x + this.constrainedDrawInfo.width / 2 : (this.xPos + this.translateScaleForMouseInteraction.x) + this.width / 2;
      yEdgeCenter = (this.constrainedDrawInfo) ? this.constrainedDrawInfo.y : this.yPos + this.translateScaleForMouseInteraction.y;
    } else if (side === 'r') {
      xEdgeCenter = (this.constrainedDrawInfo) ? this.constrainedDrawInfo.x + this.constrainedDrawInfo.width : (this.xPos + this.translateScaleForMouseInteraction.x) + this.width;
      yEdgeCenter = (this.constrainedDrawInfo) ? this.constrainedDrawInfo.y + this.constrainedDrawInfo.height / 2 : (this.yPos + this.translateScaleForMouseInteraction.y) + this.height / 2;
    } else if (side === 'b') {
      xEdgeCenter = (this.constrainedDrawInfo) ? this.constrainedDrawInfo.x + this.constrainedDrawInfo.width / 2 : (this.xPos + this.translateScaleForMouseInteraction.x) + this.width / 2;
      yEdgeCenter = (this.constrainedDrawInfo) ? this.constrainedDrawInfo.y + this.constrainedDrawInfo.height : (this.yPos + this.translateScaleForMouseInteraction.y) + this.height;
    } else if (side === 'l') {
      xEdgeCenter = (this.constrainedDrawInfo) ? this.constrainedDrawInfo.x : (this.xPos + this.translateScaleForMouseInteraction.x);
      yEdgeCenter = (this.constrainedDrawInfo) ? this.constrainedDrawInfo.y + this.constrainedDrawInfo.width / 2 : (this.yPos + this.translateScaleForMouseInteraction.y) + this.width / 2;
    } else {
      throw new Error("You didn't specify a recognizable side!");
    }

    return {x: xEdgeCenter, y: yEdgeCenter};
  }

  protected isTarget(mouseX: number, mouseY: number, cameraPosition: Triple): boolean {
    const bottomLeftCorner: Point = {
      x: (((this.constrainedDrawInfo) ? this.constrainedDrawInfo.x : this.xPos + this.translateScaleForMouseInteraction.x) + cameraPosition.x) * cameraPosition.z,
      y: (((this.constrainedDrawInfo) ? this.constrainedDrawInfo.y : this.yPos  + this.translateScaleForMouseInteraction.y) + cameraPosition.y) * cameraPosition.z
    };

    const topRightCorner: Point = {
      x: ((((this.constrainedDrawInfo) ? this.constrainedDrawInfo.x : this.xPos + this.translateScaleForMouseInteraction.x) + cameraPosition.x) + ((this.constrainedDrawInfo) ? this.constrainedDrawInfo.width : this.width)) * cameraPosition.z,
      y: ((((this.constrainedDrawInfo) ? this.constrainedDrawInfo.y : this.yPos + this.translateScaleForMouseInteraction.y) + cameraPosition.y) + ((this.constrainedDrawInfo) ? this.constrainedDrawInfo.height : this.height)) * cameraPosition.z
    };

    return (mouseX > bottomLeftCorner.x && mouseX < topRightCorner.x && mouseY > bottomLeftCorner.y && mouseY < topRightCorner.y);
  }

  protected move(xPos: number, yPos: number): void {
    this.x = xPos;
    this.y = yPos;
  }

  protected setDimensionsAndDrawLevel(zoomLevel: number) {
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

  private _drawState() {
    this.pad.push();

    if (this.isSelected)
      this._highlight();
    else if (this._isHover)
      this._hover();

    if (this.isInitial)
      this.pad.fill(190, 190, 190);

    if (!this.shouldDrawChildren) {
      if (this.constrainedDrawInfo) {
        this._drawConstrained();
      } else {
        this._drawBasicState();
      }
    } else {
      this._drawExpandedState();
    }

    this.pad.pop();
  }

  private _drawConstrained() {
    this.pad.rect(this.constrainedDrawInfo.x, this.constrainedDrawInfo.y, this.constrainedDrawInfo.width, this.constrainedDrawInfo.height, 0);
  }

  private _drawBasicState() {
    this.pad.rect(this.xPos, this.yPos, this.width, this.height, this.defaultPadding);
  }

  private _drawExpandedState() {
    this.pad.rect(this.xPos, this.yPos - this.snackbarHeight, (this.pad.textWidth(this.label) + 2 * this.defaultPadding), this.snackbarHeight, this.defaultPadding, this.defaultPadding, 0, 0);
    this.pad.rect(this.xPos, this.yPos, this.width, this.height, 0, this.defaultPadding, this.defaultPadding, this.defaultPadding);
  }

  private _drawLabel() {
    if (!this.shouldDrawChildren) {
      if (this.constrainedDrawInfo) {
        this._drawLabelConstrained();
      } else {
        this._drawLabelInsideState();
      }
    } else {
      this._drawLabelInSnackBar();
    }
  }

  private _drawLabelConstrained() {
    this.pad.textAlign(this.pad.CENTER);
    this.pad.text(this.label, this.constrainedDrawInfo.x + this.constrainedDrawInfo.width / 2, this.constrainedDrawInfo.y + this.constrainedDrawInfo.height / 2);
  }

  private _drawLabelInSnackBar() {
    this.pad.textAlign(this.pad.LEFT);
    this.pad.text(this.label, this.xPos + this.defaultPadding, (this.yPos - this.snackbarHeight + (this.snackbarHeight - this.pad.textSize() / 2)));
  }

  private _drawLabelInsideState() {
    this.pad.textAlign(this.pad.CENTER);
    this.pad.text(this.label, this.xPos + this.width / 2, this.yPos + this.height / 2);
    if (this._name != null) {
      this.pad.push();
      const originalFontSize = this.pad.textSize();
      this.pad.textSize(originalFontSize * 0.75);
      this.pad.fill('#c9c9c9');
      this.pad.text("("+this.title+")",this.xPos + this.width / 2, (this.yPos + this.height / 2) + originalFontSize);
      this.pad.pop();
    }
  }

  private _highlight() {
    this.pad.stroke(255, 204, 0);
    this.pad.strokeWeight(4);
  }

  private _hover() {
    this.pad.stroke(192, 192, 192);
    this.pad.strokeWeight(4);
  }

  private handleEvent(event: Event) {
    switch (event.type) {
      case EventType.STATE_EXPANSION:
        this.handleStateExpansion(event.data);
        break;
      case EventType.STATE_SHRINK:
        this.handleStateShrink(event.data);
        break;
    }
  }

  private handleStateExpansion(data: {
    point: { x: number, y: number },
    old: { width: number, height: number },
    new: { width: number, height: number }
  }) {
    if (this.x > data.point.x) {
      this.x += data.new.width - data.old.width;
    }
    if (this.y > data.point.y) {
      this.y += data.new.height - data.old.height;
    }
  }

  private handleStateShrink(data: {
    point: { x: number, y: number },
    old: { width: number, height: number },
    new: { width: number, height: number }
  }) {
    if (this.x > data.point.x) {
      this.x += data.new.width - data.old.width;
    }
    if (this.y > data.point.y) {
      this.y += data.new.height - data.old.height;
    }
  }
}
