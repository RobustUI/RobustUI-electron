import {AfterViewInit, Component, Input} from '@angular/core';
import * as P5 from 'p5';
import {BasicState} from "../states/basicState";
import {
  implementsClickable, implementsDragable,
  implementsDrawable,
  implementsOnPressed,
  implementsOnReleased,
  implementsUpdatable
} from "../implements";

@Component({
  selector: 'app-pad-controller',
  templateUrl: './pad-controller.component.html',
  styleUrls: ['./pad-controller.component.scss']
})
export class PadControllerComponent implements AfterViewInit {
  public p5: P5;

  @Input()
  private parent: HTMLElement;

  private elements: any[] = [];

  public ngAfterViewInit(): void {
    this.p5 = new P5(this.sketch.bind(this));

    this.elements.push(...[
      new BasicState(this.p5, "Hello", 200, 50, 50),
      new BasicState(this.p5, "World", 200, 200, 50),
      {a: 'hello'}
    ]);
  }

  private sketch(p: P5) {
    p.preload = this.preload.bind(this);
    p.setup = this.setup.bind(this);
    p.windowResized = this.windowsResized.bind(this);
    p.mouseClicked = this.mouseClicked.bind(this);
    p.mousePressed = this.mousePressed.bind(this);
    p.mouseReleased = this.mouseReleased.bind(this);
    p.mouseDragged = this.mouseDragged.bind(this);
    p.draw = this.draw.bind(this);
  }

  private preload(): void {

  }

  private setup(): void {
    this.p5.createCanvas(this.parent.clientWidth, this.parent.clientHeight).parent('designPad');
  }

  private windowsResized(): void {
    this.p5.resizeCanvas(this.parent.clientWidth, this.parent.clientHeight);
  }

  private draw(): void {
    this.p5.clear();
    this.elements.filter((e) => implementsDrawable(e)).forEach(e => e.draw());
    this.update();
  }

  private update(): void {
    this.elements.filter((e) => implementsUpdatable(e)).forEach(e => e.update());
  }

  private mouseClicked(): void {
    this.elements.filter((e) => implementsClickable(e)).forEach(e => e.clickEvent());
  }

  private mousePressed(): void {
    this.elements.filter((e) => implementsOnPressed(e)).forEach(e => e.pressedEvent());
  }

  private mouseReleased(): void {
    this.elements.filter((e) => implementsOnReleased(e)).forEach(e => e.releasedEvent());
  }

  private mouseDragged(): void {
    this.elements.filter((e) => implementsDragable(e)).forEach(e => e.dragEvent());
  }
}
