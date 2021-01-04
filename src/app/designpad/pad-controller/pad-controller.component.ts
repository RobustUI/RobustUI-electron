import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy
} from '@angular/core';
import * as P5 from 'p5';
import {
  implementsClickable,
  implementsDoubleClickable,
  implementsDraggable,
  implementsDrawable,
  implementsOnPressed,
  implementsOnReleased,
  implementsUpdatable
} from "../implements";
import {Point} from "../elements/point";
import {Triple} from "../elements/triple";
import {Event, EventDispatcher} from "../eventDispatcher";
import {Subscription} from "rxjs";
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {RobustUiStateTypes} from "../../entities/robust-ui-state-types";
import {BasicState} from "../elements/basicState";
import {Transition} from "../elements/transition";
import {SimpleComponent} from "../elements/simpleComponent";

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


  private cameraPosForComponent = new Map<string, Triple>();
  private _component: RobustUiComponent;
  private zMin = 1;
  private zMax = 9.00;
  private sensativity = 0.005;
  private font: P5.Font;
  private cameraPos: Triple = {x: 0, y:0, z: 1};
  private cameraOffset: Point = {x: 0, y: 0};

  private elements: any[] = [];
  private eventDispatcherSubscription: Subscription;

  private eventSet: Event[] = [];

  constructor() {
    this.eventDispatcherSubscription = EventDispatcher.getInstance().stream().subscribe((event: Event) => {
      this.eventSet.push(event);
    });
  }
  public ngAfterViewInit(): void {
    console.log(this.elements);
    this.p5 = new P5(() => {});
    this.sketch(this.p5);
    this.convertComponent();
  }

  public ngOnDestroy(): void {
    this.eventDispatcherSubscription.unsubscribe();
    if (this.p5 != null) {
      this.p5.remove();
    }
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
  }

  private mouseClicked(): void {
    this.elements.filter((e) => implementsClickable(e)).forEach(e => e.clickEvent(this.cameraPos));
  }

  private mousePressed(): void {
    if (this.p5.keyCode === 32) {
      this.cameraOffset = {
        x: (this.cameraPos.x * this.cameraPos.z) - this.p5.mouseX,
        y: (this.cameraPos.y * this.cameraPos.z) - this.p5.mouseY
      };
    }
    this.elements.filter((e) => implementsOnPressed(e)).forEach(e => e.pressedEvent(this.cameraPos));
  }

  private mouseReleased(): void {
    this.elements.filter((e) => implementsOnReleased(e)).forEach(e => e.releasedEvent());
  }

  private mouseDragged(): void {
    if (this.p5.keyIsDown(32)) {
      this.cameraPos.x = (this.p5.mouseX + this.cameraOffset.x) / this.cameraPos.z;
      this.cameraPos.y = (this.p5.mouseY + this.cameraOffset.y) / this.cameraPos.z;
      return;
    }

    this.elements.filter((e) => implementsDraggable(e)).forEach(e => e.dragEvent(this.cameraPos));
  }

  private doubleClicked(): void {
    this.elements.filter((e) => implementsDoubleClickable(e)).forEach(e => e.doubleClickEvent(this.cameraPos));
  }

  private mouseWheel(event: WheelEvent) {
    this.cameraPos.z -= this.sensativity * event.deltaY;
    this.cameraPos.z = this.p5.constrain(this.cameraPos.z, this.zMin, this.zMax);

    return false;
  }

  private convertComponent() {
    this.elements = [];
    if (this._component == null) {
      return;
    }
    if (this._component.type === RobustUiStateTypes.simpleComponent) {
      const states = new Map<string, BasicState>();
      let i = 1;
      this._component.states.forEach(state => {
        states.set(state.label, new BasicState(this.p5, state.label, (i === 1) ? 0 : 50, ((i === 1) ? 0 : 50) * i, 50));
        i += 3;
      });

      this._component.transitions.forEach(transition => {
        this.elements.push(
          new Transition(this.p5, transition.label, states.get(transition.from), states.get(transition.to))
        );
      });

      states.forEach((state) => { this.elements.push(state); });
    }
  }
}
