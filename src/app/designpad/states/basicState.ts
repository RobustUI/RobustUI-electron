import * as P5 from 'p5';
import {Draggable} from "../interactions/draggable";
import {Drawable, Updatable} from "../interactions/p5Core";

export class BasicState extends Draggable implements Drawable, Updatable{
  protected get p5(): P5 {
    return this.pad;
  }
  protected get xPos(): number {
    return this.x;
  }
  protected get yPos(): number {
    return this.y;
  }

  private type = 'basic';
  private _isHover = false;

  constructor(private pad: P5, private title: string, private x: number, private y: number, private w: number) {
    super();
  }

  public draw(): void {
    this.pad.push();

    if (this.isSelected)
      this._highlight();
    else if (this._isHover)
      this._hover();

    this._draw();
    this.pad.pop();
  }

  public update(): void {
    this._isHover = this.isTarget(this.pad.mouseX, this.pad.mouseY);
  }

  public getCenterOfEdge(side: string): {x: number, y: number} {
    let xEdgeCenter;
    let yEdgeCenter;

    const distanceFromCenterToEdge = this.w / 2;

    if (side === 't') {
      xEdgeCenter = this.x;
      yEdgeCenter = this.y - distanceFromCenterToEdge;
    }
    else if(side === 'r') {
      xEdgeCenter = this.x + distanceFromCenterToEdge;
      yEdgeCenter = this.y;
    }
    else if (side === 'b') {
      xEdgeCenter = this.x;
      yEdgeCenter = this.y + distanceFromCenterToEdge;
    }
    else if (side === 'l') {
      xEdgeCenter = this.x - distanceFromCenterToEdge;
      yEdgeCenter = this.y;
    } else {
      throw new Error("You didn't specify a recognizable side!");
    }


    return {x: xEdgeCenter, y: yEdgeCenter };
  }


  public toJsonObj(): any {
    return { "name": this.title, "type": "BASICSTATE"};
  }


  protected isTarget(mouseX: number, mouseY: number): boolean {
    return this.pad.dist(this.x, this.y, mouseX, mouseY) <= this.w / 2;
  }

  protected move(xPos: number, yPos: number): void {
    this.x = xPos;
    this.y = yPos;
  }

  private _draw() {
    this.pad.rectMode(this.pad.CENTER);
    this.pad.textAlign(this.pad.CENTER);
    this.pad.rect(this.x, this.y, this.w, this.w, 5);
    this.pad.text(this.title, this.x, this.y);
  }

  private _highlight() {
    this.pad.stroke(255, 204, 0);
    this.pad.strokeWeight(4);
  }

  private _hover() {
    this.pad.stroke(192, 192, 192);
    this.pad.strokeWeight(4);
  }
}
