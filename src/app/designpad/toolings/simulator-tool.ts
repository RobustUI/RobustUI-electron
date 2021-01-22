import {Tool} from "./tool";
import {ToolTypes} from "./toolTypes";
import * as P5 from 'p5';
import {ComponentRepository} from "../../componentRepository";
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {take} from "rxjs/operators";
import {BasicState} from "../elements/basicState";
import {Transition} from "../elements/transition";
import {Triple} from "../elements/triple";
import {Point} from "../elements/point";
import {EventDispatcher, EventType} from "../eventDispatcher";

export class SimulatorTool extends Tool {
  private currentState: BasicState;
  private currentActiveTransistions: Transition[];
  private states: BasicState[];
  private transitions: Transition[];

  constructor(p5: P5, private elements: any[]) {
    super(p5);
    this.states = this.elements.filter(e => e instanceof BasicState);
    this.transitions = this.elements.filter(e => e instanceof Transition);
    const initialState = this.states.find(e => e.isInitial);

    if(initialState == null) {
      EventDispatcher.getInstance().emit({type: EventType.SWITCH_TOOL, data: 'SelectTool' as ToolTypes});
    } else {
      this.elements.forEach(e => e.isSelected = false);
      this.setConfiguration(initialState);
    }
  }

  public get name(): ToolTypes {
    return 'SimulatorTool';
  }

  public mouseClicked(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    const clickedTransition = this.currentActiveTransistions.find(e => e.selectEvent(cameraPosition));

    if (clickedTransition != null) {
      this.setConfiguration(clickedTransition.getTo);
    }
  }

  private setConfiguration(nextState: BasicState): void {
    if (this.currentState != null) {
      this.currentState.isSelected = false;
    }
    this.currentState = nextState;
    this.currentState.isSelected = true;

    if (this.currentActiveTransistions != null) {
      this.removeHighlightFromActiveTransitions();
    }

    this.currentActiveTransistions = this.transitions.filter(e => e.getFrom === this.currentState);

    this.addHighlightToActiveTransitions();
  }

  public onDestroy() {
    if (this.currentState != null) {
      this.removeHighlightFromActiveTransitions();
    }
  }

  private removeHighlightFromActiveTransitions() {
    this.currentActiveTransistions.forEach(e => {
      e.isSelected = false;
    });
  }

  private addHighlightToActiveTransitions() {
    this.currentActiveTransistions.forEach(e => {
      e.isSelected = true;
    });
  }
}
