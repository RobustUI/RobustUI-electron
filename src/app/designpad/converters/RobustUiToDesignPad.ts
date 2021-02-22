import {RobustUiComponent} from "../../entities/robust-ui-component";
import {RobustUiSimpleComponent} from "../../entities/robust-ui-simple-component";
import {RobustUiCompositeComponent} from "../../entities/robust-ui-composite-component";
import {BasicState} from "../elements/basicState";
import {Transition} from "../elements/transition";
import {RobustUiStateTypes} from "../../entities/robust-ui-state-types";
import * as P5 from 'p5';
import {SimpleComponent} from "../elements/simpleComponent";
import {Position} from "../../interfaces/position";
import {CompositeComponent} from "../elements/compositeComponent";
import {ComponentRepository} from "../../componentRepository";

export class RobustUiToDesignPad {
  public static convert(component: RobustUiComponent, pad: P5, repo: ComponentRepository, position: Position = null): SimpleComponent | CompositeComponent {
    switch (component.type) {
      case RobustUiStateTypes.simpleComponent:
        return this.convertSimpleComponent((component as RobustUiSimpleComponent), pad, position);
      case RobustUiStateTypes.compositeComponent:
        return this.convertCompositeComponent((component as RobustUiCompositeComponent), pad, position, repo);
        break;
      default:
        throw new Error("Could not convert component to DeisgnPad");
    }
  }

  private static convertSimpleComponent(component: RobustUiSimpleComponent, pad: P5, position: Position): SimpleComponent {
    const states = new Map<string, BasicState>();

    component.states.forEach(state => {
      const pos = component.position.get(state.label);
      states.set(state.label, new BasicState(pad, state.label, pos.x, pos.y, pos.width, (state.label === component.initialState.label)));
    });
    const transitions: Transition[] = [];
    component.transitions.forEach(transition => {
      const isInput = component.inputs.has(transition.label);
      const isOutput = component.outputs.has(transition.label);

      let label = transition.label;
      label += (isInput) ? '?' : '';
      label += (isOutput) ? '!' : '';

      transitions.push(
        new Transition(pad, label, states.get(transition.from), states.get(transition.to))
      );
    });

    if (position == null) {
      position = {
        x: 0,
        y: 0,
        width: 0
      };
    }

    const obj = new SimpleComponent(pad, component.label, Array.from(states.values()), transitions, position.x, position.y, position.width);
    obj.drawLevel = 0;

    return obj;
  }

  private static convertCompositeComponent(component: RobustUiCompositeComponent, pad: P5, position: Position, repo: ComponentRepository): CompositeComponent {
    const subComponents = new Map<string, BasicState>();

    component.components.forEach((type, name) => {
      const comp = repo.snapshot.find(el => el.label === type);
      const pos = component.position.get(name);
      const obj = RobustUiToDesignPad.convert(comp, pad, repo, pos);
      obj.name = name;
      subComponents.set(name, obj);
    });

    if (position == null) {
      position = {
        x: 0,
        y: 0,
        width: 0
      };
    }

    const obj = new CompositeComponent(pad, component.label, subComponents, position.x, position.y, position.width);
    obj.drawLevel = 0;

    return obj;
  }
}
