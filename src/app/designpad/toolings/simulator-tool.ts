import {Tool} from "./tool";
import {ToolTypes} from "./toolTypes";
import * as P5 from 'p5';
import {BasicState} from "../elements/basicState";
import {Transition} from "../elements/transition";
import {Triple} from "../elements/triple";
import {Point} from "../elements/point";
import {EventDispatcher, EventType} from "../eventDispatcher";
import {Subject} from "rxjs";
import {SimulatorTrace} from "../../interfaces/simulator-trace";

export class SimulatorTool extends Tool {
  private currentState: BasicState;
  private currentActiveTransitions: Transition[];
  private states: BasicState[];
  private transitions: Transition[];
  private traceSubject: Subject<SimulatorTrace>;

  constructor(p5: P5, private elements: any[], traceSubject: Subject<SimulatorTrace>) {
    super(p5);
    this.traceSubject = traceSubject;
    this.states = this.elements.filter(e => e instanceof BasicState);
    this.transitions = this.elements.filter(e => e instanceof Transition);
    const initialState = this.states.find(e => e.isInitial);
    if (initialState == null) {
      EventDispatcher.getInstance().emit({type: EventType.SWITCH_TOOL, data: 'SelectTool' as ToolTypes});
    } else {
      this.elements.forEach(e => e.isSelected = false);
      this.setInitialConfiguration(initialState);
    }
  }

  public get name(): ToolTypes {
    return 'SimulatorTool';
  }

  public mouseClicked(elements: any[], cameraPosition: Triple, mouseCoordinates: Point): void {
    const clickedTransition = this.currentActiveTransitions.find(e => e.selectEvent(cameraPosition));

    if (clickedTransition != null) {
      this.setConfiguration(clickedTransition);
    }
  }

  private setInitialConfiguration(nextState: BasicState): void {
    this.currentState = nextState;
    this.currentState.isSelected = true;
    this.currentActiveTransitions = this.transitions.filter(e => e.getFrom === this.currentState);
    this.addHighlightToActiveTransitions();
  }

  private setConfiguration(nextState: Transition): void {
    if (this.currentState != null) {
      this.currentState.isSelected = false;
    }
    this.currentState = nextState.getTo;
    this.currentState.isSelected = true;

    if (this.currentActiveTransitions != null) {
      this.removeHighlightFromActiveTransitions();
    }
    this.traceSubject.next({
      action: nextState.getEvent,
      from: nextState.getFrom.label,
      to: nextState.getTo.label
    });

    this.currentActiveTransitions = this.transitions.filter(e => e.getFrom === this.currentState);

    this.addHighlightToActiveTransitions();
  }

  public onDestroy(): void {
    if (this.currentState != null) {
      this.removeHighlightFromActiveTransitions();
    }
  }

  private removeHighlightFromActiveTransitions() {
    this.currentActiveTransitions.forEach(e => {
      e.isSelected = false;
    });
  }

  private addHighlightToActiveTransitions() {
    this.currentActiveTransitions.forEach(e => {
      e.isSelected = true;
    });
  }
}
