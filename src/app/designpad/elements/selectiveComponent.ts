import {BasicState} from "./basicState";
import * as P5 from 'p5';
import {ObserverData} from "../../entities/robust-ui-selective-component";
import {Triple} from "./triple";
import {Event, EventDispatcher, EventType} from "../eventDispatcher";
import {GridBuilder} from "../pad-controller/helpers/GridBuilder";

export interface caseComponent {
  expression: string;
  component: BasicState;
}

export class SelectiveComponent extends BasicState {
  public get getCases(): BasicState[] {
    return this.cases.map(e => e.component);
  }

  constructor(
    pad: P5,
    title: string,
    private observer: ObserverData,
    private cases: caseComponent[],
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
      GridBuilder.drawSelectiveElementsLayout(
        this.cases,
        this.width,
        this.getRawHeight(),
        {x: this.xPos, y: this.yPos},
        this.pad,
        this.childrenDrawLevel,
        cameraPosition
      );
    }
  }

  public update(cameraPosition: Triple, events: Event[]) {
    super.update(cameraPosition, events);
    this.setDimensionsAndDrawLevel(cameraPosition.z);
    this.cases.forEach(e => e.component.update(cameraPosition, events));
  }


  protected setDrawLevelAndCalculateExpandedDimensions(): void {
    this.childrenDrawLevel = this._drawLevel + 1;
    this.cases.forEach(e => {
      e.component.drawLevel = this.childrenDrawLevel;
    });
  }
}
