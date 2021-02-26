import {Tool} from "./tool";
import {ToolTypes} from "./toolTypes";
import * as P5 from 'p5';
import {ComponentRepository} from "../../componentRepository";
import {RobustUiToDesignPad} from "../converters/RobustUiToDesignPad";
import {EventDispatcher, EventType} from "../eventDispatcher";
import {Observable, Subscription} from "rxjs";
import {take} from "rxjs/operators";
import {BasicState} from "../elements/basicState";
import {SelectiveComponent} from "../elements/selectiveComponent";
import {Transition} from "../elements/transition";

export class AddComponentTool extends Tool{
  public readonly name: ToolTypes = 'AddComponentTool';
  private subscriptions: Subscription[] = [];

  constructor(pad: P5, private elements: any[], private parentDesignObject: BasicState, private componentRepo: ComponentRepository, private openModal: () => void, private closeModal: () => void, private selectedComponent: Observable<{name: string, type: string}>) {
    super(pad);
    this.openModal();
    this.subscriptions.push(selectedComponent.pipe(take(1)).subscribe((res) => {
      if (res != null) {
        this.addComponent(res);
      }
      this.closeModal();
      EventDispatcher.getInstance().emit({type: EventType.SWITCH_TOOL, data: 'SelectTool' as ToolTypes});
    }));
  }

  public onDestroy(): void {
    super.onDestroy();

    if (this.subscriptions.length > 0) {
      this.subscriptions.filter(e => !e.closed).forEach(e => e.unsubscribe());
      this.subscriptions = [];
    }
  }

  private addComponent(component: { name: string, type: string }) {
    const comp = this.componentRepo.snapshot.find((e) => e.label === component.type);
    const converted = RobustUiToDesignPad.convert(comp, this.p5, this.componentRepo);
    converted.drawLevel = 1;
    if (component.name.trim().length > 0) {
      converted.name = component.name;
    }
    this.elements.push(converted);

    if (this.parentDesignObject instanceof SelectiveComponent) {
      const transition = new Transition(this.p5, "", this.parentDesignObject.initialState, converted, {from: 'r', to: 'l'});
      this.elements.push(transition);
    }
  }
}
