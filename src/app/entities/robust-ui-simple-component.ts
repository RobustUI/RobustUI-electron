import {RobustUiComponent} from "./robust-ui-component";
import {RobustUiState} from "./robust-ui-state";
import {RobustUiTransition} from "./robust-ui-transition";
import {Position} from "../interfaces/position";

export class RobustUiSimpleComponent extends RobustUiComponent {
  public states = new Map<string, RobustUiState>();
  public initialState: RobustUiState;
  public events: Set<string>;
  public transitions = new Set<RobustUiTransition>();

  constructor(
    label: string,
    type: number,
    states: Set<RobustUiState>,
    initialState: string,
    events: Set<string>,
    inputs: Set<string>,
    outputs: Set<string>,
    transitions: Set<RobustUiTransition>,
    positions: Map<string, Position>
  ) {
    super(label, type, inputs, outputs, positions);
    if (states != null) {
      states.forEach(state => this.states.set(state.label, state));
    }
    this.initialState = this.states.get(initialState);
    this.events = events;
    if (transitions != null) {
      transitions.forEach(transition => this.transitions.add(transition));
    }

    this.validateInitialStateIsInStates(initialState);
    this.validateActionsAreMutuallyExclusive(events, inputs, outputs);
    this.validateTransition(transitions);
  }

  public copy(): RobustUiSimpleComponent {
    return new RobustUiSimpleComponent(this.label, this.type, new Set(this.states.values()), this.initialState.label, this.events, this.inputs, this.outputs, new Set(this.transitions.values()), this.position);
  }

  private validateInitialStateIsInStates(initialState: string): void {
    if (initialState != null) {
      if (!this.states.has(initialState)) {
        throw new Error("Initial state must be contained with in the set of States");
      }
    }
  }

  private validateTransition(transitions: Set<RobustUiTransition>) {
    if (transitions == null) {
      return true;
    }

    transitions.forEach(transition => {
      const validFrom = this.states.has(transition.from);
      const validTo = this.states.has(transition.to);
      const validAction = (
        this.events.has(transition.label) ||
        this.inputs.has(transition.label) ||
        this.outputs.has(transition.label)
      );

      if (!validFrom) {
        throw new Error("From state in a transition must be a member of states");
      }

      if (!validTo) {
        throw new Error("To state in a transition must be a member of states");
      }

      if (!validAction) {
        throw new Error("Label of transition must be a member of actions");
      }
    });
  }

  private validateActionsAreMutuallyExclusive(events: Set<string>, inputs: Set<string>, outputs: Set<string>): void {
    if (events != null && outputs != null) {
      if (!this.isMutuallyExclusive(events, outputs)) {
        throw new Error("Events and Output-messages must be disjoint");
      }
    }

    if (events != null && inputs != null) {
      if (!this.isMutuallyExclusive(events, inputs)) {
        throw new Error("Events and Input-messages must be disjoint");
      }
    }
  }
}
