import {BasicState} from "./basicState";
import {Clickable, DoubleClickable, Drawable} from "../interactions/p5Core";
import * as P5 from "p5";
import {Point} from "./point";
import {Triple} from "./triple";
import {SelectAble} from "../interactions/selectAble";

export interface PointConnection {
  from: Point,
  to: Point,
  distance: number
}

export class Transition implements Drawable, Clickable, DoubleClickable, SelectAble{
  protected connection: PointConnection;
  private offset = 10;
  private angle: number;
  private lineLengthX: number;
  private lineLengthY: number;
  private selected = false;
  private _drawLevel = 1;

  private clickAblePoints: Point[] = [];

  public set drawLevel(drawLevel: number) {
    this._drawLevel = drawLevel;
  }

  public set setEvent(value: string) {
    this.event = value;
  }

  public get getEvent(): string {
    return this.event;
  }

  public get getFrom(): BasicState {
    return this.from;
  }

  public get getTo(): BasicState {
    return this.to;
  }

  public get isSelected(): boolean {
    return this.selected;
  }

  public set isSelected(value: boolean) {
    this.selected = value;
  }

  constructor(protected pad: P5, private event: string, private from: BasicState, private to: BasicState) {
  }

  public selectEvent(cameraPosition: Triple): boolean {
    return this.isTarget(this.pad.mouseX, this.pad.mouseY, cameraPosition);
  }

  public draw(cameraPosition: Triple): void {
    this.calculatePositions(cameraPosition);
    this.pad.push();
    if (this.selected)
      this.highlight();
    this.pad.push();
    this.pad.noFill();
    const curve = this.curveBetween(
      this.connection.from.x,
      this.connection.from.y,
      this.connection.to.x,
      this.connection.to.y,
      0.2,
      0.1,
      this.calculateCurvatureDirection()
    );
    this.pad.pop();
    this.drawEventName(curve);
    this.drawTriangle();
    this.pad.pop();
  }

  public clickEvent(cameraPosition: Triple): void {
    this.selected = this.isTarget(this.pad.mouseX, this.pad.mouseY, cameraPosition);
  }

  public doubleClickEvent(cameraPosition: Triple): boolean {
    return this.isTarget(this.pad.mouseX, this.pad.mouseY, cameraPosition);
  }

  protected calculatePositions(cameraPosition: Triple): void {
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

  private drawEventName(curve: {xs: number[], ys: number[]}): void {
    this.clickAblePoints = [];
    const steps = 5;
    const t = 2 / steps;
    const x = this.pad.bezierPoint(curve.xs[0], curve.xs[1], curve.xs[2], curve.xs[3], t);
    const y = this.pad.bezierPoint(curve.ys[0], curve.ys[1], curve.ys[2], curve.ys[3], t);
    const tanX = this.pad.bezierTangent(curve.xs[0], curve.xs[1], curve.xs[2], curve.xs[3], t);
    const tanY = this.pad.bezierTangent(curve.ys[0], curve.ys[1], curve.ys[2], curve.ys[3], t);

    let angle = this.pad.atan2(tanY, tanX);

    if (curve.xs[0] > curve.xs[3]) {
      angle += this.pad.radians(180);
    }

    this.pad.circle(x,y,5);
    this.clickAblePoints.push({x, y});
    this.clickAblePoints.push({x, y: y + 10});
    this.pad.push();
    this.pad.translate(x,y);
    this.pad.textAlign(this.pad.CENTER, this.pad.CENTER);
    this.pad.rotate(angle);
    this.pad.text(this.event, 0, 10);
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

  private isTarget(mouseX: number, mouseY: number, cameraPosition: Triple) {

    if (this.connection == null) {
      return false;
    }

    const safeDrawLevel = (this._drawLevel > 0) ? this._drawLevel : 1;

    for (const point of this.clickAblePoints) {
      const dist = this.pad.dist(
        mouseX,
        mouseY,
        ((point.x / safeDrawLevel) + cameraPosition.x) * cameraPosition.z,
        ((point.y / safeDrawLevel) + cameraPosition.y) * cameraPosition.z
      );

      if (dist <= 5) {
        return true;
      }
    }

    return false;
  }

  private highlight(): void {
    this.pad.stroke(255, 204, 0);
    this.pad.strokeWeight(4);
  }

  /*
   inputs to curveBetween:
   x1, y1, x2, y2: coordinates of start and end points
   d: how wide curve is as percentage of distance between start and end points
   h: how high curve is as percentage of distance between start and end points
   flip: whether curve should be flipped up or down (0 or 1) ie. smile or frown!
  */
  private curveBetween(x1: number, y1: number, x2: number, y2: number, d: number, h: number, flip: boolean): {xs: number[], ys: number[]} {
    const _flip = (flip) ? 1 : 0;
    //find two control points off this line
    const original = P5.Vector.sub(this.pad.createVector(x2, y2), this.pad.createVector(x1, y1));
    const inline = original.copy().normalize().mult(original.mag() * d);
    const rotated = inline.copy().rotate(this.pad.radians(90)+_flip*this.pad.radians(180)).normalize().mult(original.mag() * h);
    const p1 = P5.Vector.add(P5.Vector.add(inline, rotated), this.pad.createVector(x1, y1));

    rotated.mult(-1);
    const p2 = P5.Vector.add(P5.Vector.add(inline, rotated).mult(-1), this.pad.createVector(x2, y2));

    this.pad.bezier(x1, y1, p1.x, p1.y, p2.x, p2.y, x2, y2);

    return {xs: [x1, p1.x, p2.x, x2], ys: [y1, p1.y, p2.y, y2]};
  }

  private calculateCurvatureDirection(): boolean {
    return (this.connection.from.x < this.connection.to.x && this.connection.from.y > this.connection.to.y) ||
      (this.connection.from.x > this.connection.to.x && this.connection.from.y < this.connection.to.y);
  }
}
