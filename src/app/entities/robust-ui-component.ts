import {RobustUiState} from "./robust-ui-state";
import {RobustUiStateTypes} from "./robust-ui-state-types";
import {RobustUiTransition} from "./robust-ui-transition";

export class RobustUiComponent implements RobustUiState {
  public get label(): string {
    return this._label;
  }

  public set label(value: string) {
    this._label = value;
  }

  public get type(): RobustUiStateTypes {
    return RobustUiStateTypes.simpleComponent;
  }

  public get states(): Map<string, RobustUiState> {
    return this._states;
  }

  public set states(value: Map<string, RobustUiState>) {
    this._states = value;
  }

  public get initialState(): RobustUiState {
    return this._initialState;
  }

  public set initialState(value: RobustUiState) {
    this._initialState = value;
  }

  public get events(): Set<string> {
    return this._events;
  }

  public set events(value: Set<string>) {
    this._events = value;
  }

  public get inputs(): Set<string> {
    return this._inputs;
  }

  public set inputs(value: Set<string>) {
    this._inputs = value;
  }

  public get outputs(): Set<string> {
    return this._outputs;
  }

  public set outputs(value: Set<string>) {
    this._outputs = value;
  }

  public get transitions(): Map<string, RobustUiTransition> {
    return this._transitions;
  }

  public set transitions(value: Map<string, RobustUiTransition>) {
    this._transitions = value;
  }

  public copy(): RobustUiComponent {
    return new RobustUiComponent(this._label, new Set(this._states.values()), this._initialState.label, this._events, this._inputs, this._outputs, new Set(this._transitions.values()), this.positions);
  }

  public static factory(label: string): RobustUiComponent {
    const initialStateLabel = "initial state";
    const initialState: RobustUiState = {
      label: initialStateLabel,
      type: RobustUiStateTypes.baseState
    };
    const newState = new Set<RobustUiState>();
    const position = new Map<string, { x: number; y: number }>();
    newState.add(initialState);
    position.set(initialStateLabel, {x: 10, y: 10});
    return new RobustUiComponent(label, newState, initialState.label, new Set(), new Set(), new Set(), new Set(), position);
  }

  private _label: string;
  private _states = new Map<string, RobustUiState>();
  private _initialState: RobustUiState;
  private _events: Set<string>;
  private _inputs: Set<string>;
  private _outputs: Set<string>;
  private _transitions = new Map<string, RobustUiTransition>();

  constructor(
    label: string,
    states: Set<RobustUiState>,
    initialState: string,
    events: Set<string>,
    inputs: Set<string>,
    outputs: Set<string>,
    transitions: Set<RobustUiTransition>,
    public positions: Map<string, { x: number, y: number }>
  ) {
    this._label = label;

    if (states != null) {
      states.forEach(state => this._states.set(state.label, state));
    }

    this.validateInitialStateIsInStates(initialState);
    this.validateActionsAreMutuallyExclusive(events, inputs, outputs);

    this._initialState = this._states.get(initialState);
    this._events = events;
    this._inputs = inputs;
    this._outputs = outputs;

    this.validateTransition(transitions);

    if (transitions != null) {
      transitions.forEach(transition => this._transitions.set(transition.label, transition));
    }

  }

  private validateInitialStateIsInStates(initialState: string): void {
    if (initialState != null) {
      if (!this._states.has(initialState)) {
        throw new Error("Initial state must be contained with in the set of States");
      }
    }
  }

  private validateActionsAreMutuallyExclusive(events: Set<string>, inputs: Set<string>, outputs: Set<string>): void {
    if (inputs != null && outputs != null) {
      if (!this.isMutuallyExclusive(inputs, outputs)) {
        throw new Error("Input-messages and Output-messages must be disjoint");
      }
    }

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

  private validateTransition(transitions: Set<RobustUiTransition>) {
    if (transitions == null) {
      return true;
    }

    transitions.forEach(transition => {
      const validFrom = this._states.has(transition.from);
      const validTo = this._states.has(transition.to);
      const validAction = (
        this._events.has(transition.label) ||
        this._inputs.has(transition.label) ||
        this._outputs.has(transition.label)
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

  private isMutuallyExclusive(first: Set<string>, second: Set<string>): boolean {
    if (first.size === 0 && second.size === 0) {
      return true;
    }
    const intersection = Array.from(first).filter(x => second.has(x));

    return intersection.length === 0;
  }
}
