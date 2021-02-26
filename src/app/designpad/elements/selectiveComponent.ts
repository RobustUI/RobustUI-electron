import {BasicState} from "./basicState";
import * as P5 from 'p5';
import {ObserverData} from "../../entities/robust-ui-selective-component";
import {Triple} from "./triple";
import {Event} from "../eventDispatcher";
import {GridBuilder} from "../pad-controller/helpers/GridBuilder";
import {Transition} from "./transition";

export interface CaseComponent {
  expression: string;
  component: BasicState;
}

export class SelectiveComponent extends BasicState {
  public get getCases(): BasicState[] {
    return this.cases.map(e => e.component);
  }

  public get initialState(): BasicState {
    return this.initial;
  }

  constructor(
    pad: P5,
    title: string,
    private observer: ObserverData,
    private cases: CaseComponent[],
    private transitions: Transition[],
    private initial: BasicState,
    x: number,
    y: number,
    w: number
  ) {
    super(pad, title, x, y, w);
    this.defaultSize = w;
    this.childrenDrawLevel = this._drawLevel + 1;
    this.setDrawLevelAndCalculateExpandedDimensions();
    this._type = 'selective';
  }

  public draw(cameraPosition: Triple): void {
    super.draw(cameraPosition);

    if (this.shouldDrawChildren) {
      this.pad.push();
      this.pad.translate(this.xPos, this.yPos);
      GridBuilder.drawSelectiveElementsLayout(
        this.cases.map(e => e.component),
        this.width,
        this.getRawHeight(),
        {x: this.xPos, y: this.yPos},
        this.pad,
        this.childrenDrawLevel,
        cameraPosition
      );
      this.initial.draw(cameraPosition);
      this.transitions.forEach(e => e.draw(cameraPosition));
      this.pad.pop();
    }
  }

  public update(cameraPosition: Triple, events: Event[]): void {
    super.update(cameraPosition, events);
    this.setDimensionsAndDrawLevel(cameraPosition.z);
    this.cases.forEach(e => e.component.update(cameraPosition, events));
  }


  protected setDrawLevelAndCalculateExpandedDimensions(): void {
    this.childrenDrawLevel = this._drawLevel + 1;
    let maxWidth = 0;
    let maxHeight = 0;
    let minX = Infinity;
    let maxX = 0;
    let minY = Infinity;
    let maxY = 0;
    this.cases.forEach(e => {
      e.component.drawLevel = this.childrenDrawLevel;

      if (e.component.xPos < minX) {
        minX = e.component.xPos;
      }

      if (e.component.xPos > maxX) {
        maxX = e.component.xPos;
        maxWidth = e.component.width;
      }

      if (e.component.yPos < minY) {
        minY = e.component.yPos;
      }

      if (e.component.yPos > maxY) {
        maxY = e.component.yPos;
        maxHeight = e.component.height;
      }
    });
    this.expandedWidth = 10 + maxX-minX + maxWidth + minX;
    this.expandedHeight = 10 + maxY-minY + maxHeight + minY;
  }
}
