import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import * as P5 from 'p5';
import {implementsDrawable, implementsSelectable, implementsUpdatable} from "../implements";
import {Triple} from "../elements/triple";
import {Event, EventDispatcher, EventType} from "../eventDispatcher";
import {Subscription} from "rxjs";
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {RobustUiStateTypes} from "../../entities/robust-ui-state-types";
import {BasicState} from "../elements/basicState";
import {Transition} from "../elements/transition";
import {SelectTool} from "../toolings/select-tool";
import {AddStateTool} from "../toolings/add-state-tool";
import {Tool} from "../toolings/tool";
import {MoveTool} from "../toolings/move-tool";
import {AddTransitionTool} from "../toolings/add-transition-tool";
import {SimpleComponent} from "../elements/simpleComponent";
import {DesignPadToRobustUi} from "../converters/DesignPadToRobustUi";
import {ComponentRepository} from "../../componentRepository";
import {SettingsPane} from "./settingsPane";
import {ToolTypes} from "../toolings/toolTypes";
import {SimulatorTool} from "../toolings/simulator-tool";

@Component({
  selector: 'app-pad-controller',
  templateUrl: './pad-controller.component.html',
  styleUrls: ['./pad-controller.component.scss']
})
export class PadControllerComponent implements AfterViewInit, OnDestroy {
  public p5: P5;

  @Input()
  public parent: HTMLElement;

  @Input()
  public set activeTool(value: ToolTypes) {
    if (this._tool == null || value != this._tool.name) {
      if (this._tool != null) {
        this._tool.onDestroy();
      }
      switch (value) {
        case 'SelectTool':
          this._tool = new SelectTool(this.p5);
          break;
        case 'AddStateTool':
          this._tool = new AddStateTool(this.p5);
          break;
        case 'MoveTool':
          this._tool = new MoveTool(this.p5);
          break;
        case "AddTransitionTool":
          this._tool = new AddTransitionTool(this.p5);
          break;
        case "SimulatorTool":
          this._tool = new SimulatorTool(this.p5, this.elements);
          break;
      }
    }
  }

  @Output()
  public activeToolChange = new EventEmitter<ToolTypes>();

  private _tool: Tool;
  private _prevTool: ToolTypes = null;

  @Input()
  public set component(value: RobustUiComponent) {
    this._component = value;
    if (this.cameraPosForComponent.has(value.label)) {
      this.cameraPos = this.cameraPosForComponent.get(value.label);
    } else {
      this.cameraPosForComponent.set(value.label, {x: 0, y: 0, z: 1} as Triple);
      this.cameraPos = this.cameraPosForComponent.get(value.label);
    }

    this.convertComponent();
  }

  public settingsPane: SettingsPane = { open: false, item: null};
  public _component: RobustUiComponent;

  private cameraPosForComponent = new Map<string, Triple>();
  private temporaryComponent = new Map<string, any[]>();
  private zMin = 1;
  private zMax = 9.00;
  private sensativity = 0.005;
  private font: P5.Font;
  private cameraPos: Triple = {x: 0, y:0, z: 1};

  private elements: any[] = [];
  private eventDispatcherSubscription: Subscription;

  private eventSet: Event[] = [];

  constructor(private componentRepository: ComponentRepository) {
    this.eventDispatcherSubscription = EventDispatcher.getInstance().stream().subscribe((event: Event) => {
      if(event.type === EventType.SWITCH_TOOL) {
        this.setTool(event.data);
      } else if (event.type === EventType.SHOW_SETTINGS) {
        this.settingsPane = {open: true, item: event.data};
      } else if (event.type === EventType.SAVE_COMPONENT) {
        try {
          const comp = DesignPadToRobustUi.convert(this.elements, event.data);
          this.componentRepository.save(event.data.label, comp);
        } catch (e) {
          alert(e.message);
        }
      } else {
        this.eventSet.push(event);
      }
    });
  }
  public ngAfterViewInit(): void {
    this.p5 = new P5(() => {});
    this.sketch(this.p5);
    this.convertComponent();
    this._tool = new SelectTool(this.p5);
  }

  public ngOnDestroy(): void {
    this.eventDispatcherSubscription.unsubscribe();
    if (this.p5 != null) {
      this.p5.remove();
    }
  }

  public checkType(item: any): string {
    if (item instanceof Transition) {
      return "Transition";
    } else if (item instanceof BasicState) {
      return "BasicState";
    } else if (item instanceof SimpleComponent) {
      return "SimpleComponent";
    } else {
      return "unknown";
    }
  }

  public closeSettings(): void {
    this.settingsPane = {open: false, item: null};
  }

  private sketch(p: P5) {
    p.preload = this.preload.bind(this);
    p.setup = this.setup.bind(this);
    p.windowResized = this.windowsResized.bind(this);
    p.mouseClicked = this.mouseClicked.bind(this);
    p.mousePressed = this.mousePressed.bind(this);
    p.mouseReleased = this.mouseReleased.bind(this);
    p.mouseDragged = this.mouseDragged.bind(this);
    p.doubleClicked = this.doubleClicked.bind(this);
    p.mouseWheel = this.mouseWheel.bind(this);
    p.draw = this.draw.bind(this);
    p.keyPressed = this.keyPressed.bind(this);
    p.keyReleased = this.keyReleased.bind(this);
    p.preload();
    p.setup();
  }

  private preload(): void {
    this.font = this.p5.loadFont('assets/fonts/Roboto-Regular.ttf');
  }

  private setup(): void {
    this.p5.createCanvas(this.parent.clientWidth, this.parent.clientHeight).parent('designPad');
    this.p5.textFont(this.font);
    this.p5.translate(this.p5.width/2, this.p5.height/2);
  }

  private windowsResized(): void {
    this.p5.resizeCanvas(this.parent.clientWidth, this.parent.clientHeight);
  }

  private draw(): void {
    this.p5.clear();
    this.p5.scale(this.cameraPos.z);
    this.p5.translate(this.cameraPos.x, this.cameraPos.y);
    this.elements.filter((e) => implementsDrawable(e)).forEach(e => e.draw(this.cameraPos));
    this.update();
  }

  private update(): void {
    const events = this.eventSet.slice();
    this.eventSet = [];
    this.elements.filter((e) => implementsUpdatable(e)).forEach(e => e.update(this.cameraPos, events));
    this.storeInTemporaryObject();
  }

  private mouseClicked(): void {
    if(this.mouseActionInsidePad()) {
      this._tool.mouseClicked(this.elements, this.cameraPos, {x: this.p5.mouseX, y: this.p5.mouseY});
    }
  }

  private mousePressed(): void {
    if(this.mouseActionInsidePad()) {
      this._tool.mousePressed(this.elements, this.cameraPos, {x: this.p5.mouseX, y: this.p5.mouseY});
    }
  }

  private mouseReleased(): void {
    if(this.mouseActionInsidePad()) {
      this._tool.mouseReleased(this.elements, this.cameraPos, {x: this.p5.mouseX, y: this.p5.mouseY});
    }
  }

  private mouseDragged(): void {
    if(this.mouseActionInsidePad()) {
      this._tool.mouseDragged(this.elements, this.cameraPos, {x: this.p5.mouseX, y: this.p5.mouseY});
    }
  }

  private doubleClicked(): void {
    if(this.mouseActionInsidePad()) {
      this._tool.doubleClicked(this.elements, this.cameraPos, {x: this.p5.mouseX, y: this.p5.mouseY});
    }
  }

  private mouseWheel(event: WheelEvent) {
    this.cameraPos.z -= this.sensativity * event.deltaY;
    this.cameraPos.z = this.p5.constrain(this.cameraPos.z, this.zMin, this.zMax);

    return false;
  }

  private keyPressed(): void {
    switch (this.p5.keyCode) {
      case this.p5.DELETE:
        if (this.mouseActionInsidePad()) {
          this.deleteAllSelectedElements();
        }
        break;
      case 32:
        this.tempSetMoveTool();
        break;
    }
  }

  private deleteAllSelectedElements(): void {
    const deleteIndexes = [];
    this.elements.filter(e => implementsSelectable(e)).filter(e => e.isSelected).forEach(e => {
      deleteIndexes.push(this.elements.indexOf(e));
    });

    deleteIndexes.sort().reverse().forEach(e => {
      this.elements.splice(e, 1);
    });
  }

  private keyReleased(): void {
    this.removeTempTool();
  }

  private tempSetMoveTool() {
    this._prevTool = this._tool.name;
    this.setTool("MoveTool");
  }

  private removeTempTool() {
    if (this._prevTool != null) {
      this.setTool(this._prevTool);
    }
    this._prevTool = null;
  }

  private mouseActionInsidePad(): boolean {
    return (this.p5.mouseX <= this.p5.width && this.p5.mouseX >= 0 && this.p5.mouseY <= this.p5.height && this.p5.mouseY >= 0);
  }

  private setTool(tool: ToolTypes): void {
    this.activeTool = tool;
    this.activeToolChange.emit(tool);
  }

  private convertComponent() {
    this.elements = [];
    if (this.temporaryComponent.has(this._component.label)) {
      this.elements = this.temporaryComponent.get(this._component.label);
      return;
    }
    if (this._component == null) {
      return;
    }
    if (this._component.type === RobustUiStateTypes.simpleComponent) {
      const states = new Map<string, BasicState>();

      this._component.states.forEach(state => {
        const position = this._component.positions.get(state.label);
        states.set(state.label, new BasicState(this.p5, state.label, position.x, position.y, 50, (state.label === this._component.initialState.label)));
      });
      const transitions: Transition[] = [];
      this._component.transitions.forEach(transition => {
        const isInput = this._component.inputs.has(transition.label);
        const isOutput = this._component.outputs.has(transition.label);

        let label = transition.label;
        label += (isInput) ? '?' : '';
        label += (isOutput) ? '!' : '';

        transitions.push(
          new Transition(this.p5, label, states.get(transition.from), states.get(transition.to))
        );
      });

      this.elements.push(
        ...transitions,
        ...Array.from(states.values())
      );
    } else if (this._component.type === RobustUiStateTypes.compositeComponent) {

    }
  }

  private storeInTemporaryObject(): void {
    this.temporaryComponent.set(this._component.label, this.elements);
  }
}
