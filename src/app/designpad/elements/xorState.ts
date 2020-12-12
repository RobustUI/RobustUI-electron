import {BasicState} from "./basicState";
import {Transition} from "./transition";
import * as P5 from "p5";
import {DoubleClickable} from "../interactions/p5Core";

export class XorState extends BasicState implements DoubleClickable{

  private childrenDrawLevel: number;

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
    this.childrenDrawLevel = this._drawLevel + 1;
    this.subStates.forEach(e => e.drawLevel = this.childrenDrawLevel);
    this._type = 'xor';
  }

  public draw(zoomLevel: number): void {
    this.pad.push();
    this.pad.scale(1);
    if (zoomLevel >= this.childrenDrawLevel) {
      this.subStates.forEach(e => e.draw(zoomLevel));
    }
    this.pad.pop();
    super.draw(zoomLevel);
  }

  public doubleClickEvent(): void {
    if (this.isTarget(this.pad.mouseX, this.pad.mouseY)) {
      console.log("hello world!");
    }
  }
}
