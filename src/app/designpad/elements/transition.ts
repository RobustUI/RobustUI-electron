import {BasicState} from "./basicState";
import {Clickable, Drawable, Updatable} from "../interactions/p5Core";
import * as P5 from "p5";
import {Point} from "./point";
import {Triple} from "./triple";

export interface PointConnection {
  from: Point,
  to: Point,
  distance: number
}

export class Transition implements Drawable, Updatable, Clickable{
  private connection: PointConnection;
  private offset = 10;
  private angle: number;
  private lineLengthX: number;
  private lineLengthY: number;
  private selected = false;
  private _drawLevel = 1;

  public set drawLevel(drawLevel: number) {
    this._drawLevel = drawLevel;
  }

  constructor(private pad: P5, private event: string, private from: BasicState, private to: BasicState) {
  }

  public draw(cameraPosition: Triple): void {
    this.calculatePositions(cameraPosition);
    this.pad.push();
    if (this.selected)
      this.highlight();

    this.pad.line(
      this.connection.from.x,
      this.connection.from.y,
      this.connection.to.x,
      this.connection.to.y
    );

    this.drawEventName();
    this.drawTriangle();
    this.pad.pop();
  }

  public update(cameraPosition: Triple): void {

  }

  public clickEvent(): void {
    this.selected = this.isTarget(this.pad.mouseX, this.pad.mouseY);
  }


  private calculatePositions(cameraPosition: Triple): void {
    this.connection = null;
    const fromPoints = Transition.getPoints(this.from, cameraPosition);
    const toPoints = Transition.getPoints(this.to, cameraPosition);

    this.connection = this.getNearestConnectionPoint(fromPoints, toPoints);
    this.angle = this.calculateAngle();
    this.lineLengthX = this.calculateLineLengthX();
    this.lineLengthY = this.calculateLineLengthY();
  }

  private static getPoints(target: BasicState, cameraPosition: Triple) {
    return [
      target.getCenterOfEdge('t', cameraPosition),
      target.getCenterOfEdge('b', cameraPosition),
      target.getCenterOfEdge('l', cameraPosition),
      target.getCenterOfEdge('r', cameraPosition)
    ];
  }

  private getNearestConnectionPoint(fromPoints: Point[], toPoints: Point[]): PointConnection {
    let nearestPoints: PointConnection = null;

    for (const fromPoint of fromPoints) {
      for (const toPoint of toPoints) {
        const distance = this.pad.dist(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);

        if (nearestPoints == null || nearestPoints.distance > distance) {
          nearestPoints = {from: fromPoint, to: toPoint, distance};
        }
      }
    }

    return nearestPoints;
  }

  private drawEventName(): void {
    this.pad.push();
    this.pad.translate(this.connection.from.x - this.lineLengthX/2, this.connection.from.y - this.lineLengthY/2);
    this.pad.rotate(this.angle-this.pad.PI);
    this.pad.textAlign(this.pad.CENTER);
    this.pad.text(this.event, 0, -20);
    this.pad.pop();
  }

  private drawTriangle(): void {
    this.pad.push();
    this.pad.fill(0, 0, 0);
    this.pad.translate(this.connection.to.x, this.connection.to.y);
    this.pad.rotate(this.angle - this.pad.HALF_PI);
    this.pad.triangle(
      (-this.offset * 0.5) / this._drawLevel,
      this.offset / this._drawLevel,
      (this.offset * 0.5) / this._drawLevel,
      this.offset / this._drawLevel,
      0,
      (-this.offset/2) / this._drawLevel
    );
    this.pad.pop();
  }

  private calculateAngle(): number {
    return this.pad.atan2(this.connection.from.y - this.connection.to.y, this.connection.from.x - this.connection.to.x);
  }

  private calculateLineLengthX(): number {
    return this.connection.from.x - this.connection.to.x;
  }

  private calculateLineLengthY(): number {
    return this.connection.from.y - this.connection.to.y;
  }

  private isTarget(mouseX, mouseY) {
    // get distance from the point to the two ends of the line
    const d1 = this.pad.dist(mouseX,mouseY, this.connection.from.x, this.connection.from.y);
    const d2 = this.pad.dist(mouseX,mouseY, this.connection.to.x, this.connection.to.y);

    // get the length of the line
    const lineLen = this.pad.dist(this.connection.from.x, this.connection.from.y, this.connection.to.x, this.connection.to.y);

    // since floats are so minutely accurate, add
    // a little buffer zone that will give collision
    const buffer = 0.5;    // higher # = less accurate

    // if the two distances are equal to the line's
    // length, the point is on the line!
    // note we use the buffer here to give a range,
    // rather than one #
    return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
  }

  private highlight(): void {
    this.pad.stroke(255, 204, 0);
    this.pad.strokeWeight(4);
  }
}
