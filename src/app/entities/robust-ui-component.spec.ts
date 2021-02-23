import {RobustUiComponent} from "./robust-ui-component";
import {RobustUiStateTypes} from "./robust-ui-state-types";
import {RobustUiSimpleComponent} from "./robust-ui-simple-component";
/*
describe('Robust UI Component Formalism', () => {
  it('should allow empty component', function () {
    const component = new RobustUiSimpleComponent(
      'label',
      new Set([]),
      null,
      new Set([]),
      new Set([]),
      new Set([]),
      new Set([])
    );

    expect(component).not.toBeNull();
  });

  it('should allow empty component, with null objects', function () {
    const component = new RobustUiSimpleComponent(
      'label',
      null,
      null,
      null,
      null,
      null,
      null
    );

    expect(component).not.toBeNull();
  });

  it('should require initialState to be contained in states, if non empty', () => {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "Not-initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set([]),
        new Set([]),
        new Set([]),
        new Set([])
      );
    }).toThrow(new Error("Initial state must be contained with in the set of States"));
  });

  it('should construct when initial state is in states', () => {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set([]),
        new Set([]),
        new Set([]),
        new Set([])
      );
    }).not.toThrow(new Error("Initial state must be contained with in the set of States"));
  });

  it('should require input and output to be disjoint', () => {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set([]),
        new Set(['message']),
        new Set(['message']),
        new Set([])
      );
    }).toThrow(new Error("Input-messages and Output-messages must be disjoint"));
  });

  it('should construct when input && output is disjoint', () => {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set([]),
        new Set(['message1']),
        new Set(['message2']),
        new Set([])
      );
    }).not.toThrow(new Error("Input-messages and Output-messages must be disjoint"));

    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set([]),
        new Set(['message']),
        new Set([]),
        new Set([])
      );
    }).not.toThrow(new Error("Input-messages and Output-messages must be disjoint"));

    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set([]),
        new Set([]),
        new Set(['message']),
        new Set([])
      );
    }).not.toThrow(new Error("Input-messages and Output-messages must be disjoint"));
  });

  it('should require events and outputs to be disjoint', function () {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set(['message']),
        new Set([]),
        new Set(['message']),
        new Set([])
      );
    }).toThrow(new Error("Events and Output-messages must be disjoint"));
  });

  it('should require events and inputs to be disjoint', function () {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set(['message']),
        new Set(['message']),
        new Set([]),
        new Set([])
      );
    }).toThrow(new Error("Events and Input-messages must be disjoint"));
  });

  it('should require transition from to be in states', function () {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([{label: "initial", type: RobustUiStateTypes.baseState}]),
        "initial",
        new Set(['transition']),
        new Set([]),
        new Set([]),
        new Set([{label: 'transition', from: 'not-initial', to: 'initial'}])
      );
    }).toThrow(new Error("From state in a transition must be a member of states"));
  });

  it('should require transition "to" to be in states', function () {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([
          {label: "initial", type: RobustUiStateTypes.baseState},
        ]),
        "initial",
        new Set(['transition']),
        new Set([]),
        new Set([]),
        new Set([{label: 'transition', from: 'initial', to: 'not-initial'}])
      );
    }).toThrow(new Error("To state in a transition must be a member of states"));
  });

  it('should require transition label to be in actions', function () {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([
          {label: "initial", type: RobustUiStateTypes.baseState},
          {label: "not-initial", type: RobustUiStateTypes.baseState}
        ]),
        "initial",
        new Set([]),
        new Set([]),
        new Set([]),
        new Set([{label: 'transition', from: 'initial', to: 'not-initial'}])
      );
    }).toThrow(new Error("Label of transition must be a member of actions"));
  });

  it('should allow valid transitions', () => {
    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([
          {label: "initial", type: RobustUiStateTypes.baseState},
          {label: "not-initial", type: RobustUiStateTypes.baseState}
        ]),
        "initial",
        new Set(['transition']),
        new Set([]),
        new Set([]),
        new Set([{label: 'transition', from: 'initial', to: 'not-initial'}])
      );
    }).not.toThrow();

    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([
          {label: "initial", type: RobustUiStateTypes.baseState},
          {label: "not-initial", type: RobustUiStateTypes.baseState}
        ]),
        "initial",
        new Set([]),
        new Set(['transition']),
        new Set([]),
        new Set([{label: 'transition', from: 'initial', to: 'not-initial'}])
      );
    }).not.toThrow();

    expect(() => {
      new RobustUiSimpleComponent(
        'label',
        new Set([
          {label: "initial", type: RobustUiStateTypes.baseState},
          {label: "not-initial", type: RobustUiStateTypes.baseState}
        ]),
        "initial",
        new Set([]),
        new Set([]),
        new Set(['transition']),
        new Set([{label: 'transition', from: 'initial', to: 'not-initial'}])
      );
    }).not.toThrow();
  });
});*/
