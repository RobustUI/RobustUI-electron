import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import * as P5 from 'p5';
import {BasicState} from "../elements/basicState";
import {
  implementsClickable, implementsDoubleClickable, implementsDraggable,
  implementsDrawable,
  implementsOnPressed,
  implementsOnReleased,
  implementsUpdatable
} from "../implements";
import {Transition} from "../elements/transition";
import {XorState} from "../elements/xorState";
import {Point} from "../elements/point";
import {Triple} from "../elements/triple";
import {Event, EventDispatcher} from "../eventDispatcher";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-pad-controller',
  templateUrl: './pad-controller.component.html',
  styleUrls: ['./pad-controller.component.scss']
})
export class PadControllerComponent implements AfterViewInit, OnDestroy {
  public p5: P5;

  @Input()
  private parent: HTMLElement;

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
    this.p5 = new P5(this.sketch.bind(this));

    const first = new BasicState(this.p5, "Hello", 200, 50, 50);
    const second = new BasicState(this.p5, "World", 200, 200, 50);
    const foo = new BasicState(this.p5, "Foo", 400, 200, 50);
    const transition = new Transition(this.p5, "click", first, second);



    const third = new BasicState(this.p5, "third", 0, 0, 50);
    const fourth = new BasicState(this.p5, "fourth", 10, 60, 50);
    const fifth = new BasicState(this.p5, "fifth", 500, 200, 50);
    const otherTransition = new Transition(this.p5, "hover", third, fourth);
    const xor = new XorState(this.p5, "Xor-state", [fourth, third, fifth], [otherTransition], 300, 150, 50);

    this.elements.push(...[
      first, second, transition, xor, foo
    ]);
  }

  public ngOnDestroy(): void {
    this.eventDispatcherSubscription.unsubscribe();
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
}
