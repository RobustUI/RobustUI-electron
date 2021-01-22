import {Tool} from "./tool";
import {Triple} from "../elements/triple";
import {Point} from "../elements/point";
import {implementsSelectable} from "../implements";
import {BasicState} from "../elements/basicState";
import {Transition} from "../elements/transition";
import {EventDispatcher, EventType} from "../eventDispatcher";
import {TempTransition} from "../elements/tempTransition";
import {ToolTypes} from "./toolTypes";

export class AddTransitionTool extends Tool{
  public readonly name: ToolTypes = 'AddTransitionTool';
  private selectedStates: BasicState[] = [];
  private tempTransition: TempTransition = null;

  public mouseClicked(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    const el = elements.filter((e) => implementsSelectable(e)).find(e => e.selectEvent(cameraPosition));

    if (el instanceof BasicState) {
      this.selectedStates.push(el);
    }

    if (this.selectedStates.length === 1) {
      this.tempTransition = new TempTransition(this.p5, this.selectedStates[0]);
      elements.push(this.tempTransition);
    }

    if(this.selectedStates.length === 2) {
      const indexToDelete = elements.indexOf(this.tempTransition);
      if (indexToDelete > -1) {
        elements.splice(indexToDelete, 1);
      }
      elements.push(new Transition(this.p5, "", this.selectedStates[0], this.selectedStates[1]));
      EventDispatcher.getInstance().emit({type: EventType.SWITCH_TOOL, data: 'SelectTool'});
    }
  }
}
