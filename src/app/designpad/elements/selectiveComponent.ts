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
  private childrenDrawLevel: number;
  private defaultSize: number;

  private expandedWidth: number;
  private expandedHeight: number;
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
      GridBuilder.drawSelectiveElementsLayout(this.cases, this.width, this.getRawHeight(), {x: this.xPos, y: this.yPos}, this.pad, this.childrenDrawLevel, cameraPosition);
      // GridBuilder.drawColumnLayout(this.pad, {x: this.xPos + (this.width/2), y: this.yPos}, 2, this.width / 2, this.height);

    }
  }

  public update(cameraPosition: Triple, events: Event[]) {
    super.update(cameraPosition, events);
    this.setDimensionsAndDrawLevel(cameraPosition.z);
    this.cases.forEach(e => e.component.update(cameraPosition, events));
  }

  private setDimensionsAndDrawLevel(zoomLevel: number) {
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


  protected setDrawLevelAndCalculateExpandedDimensions(): void {
    this.childrenDrawLevel = this._drawLevel + 1;
    this.cases.forEach(e => {
      e.component.drawLevel = this.childrenDrawLevel;
    });
  }
}
