import {Point} from "../elements/point";
import {Triple} from "../elements/triple";
import {Event} from "../eventDispatcher";

export interface Drawable {
  draw(cameraPosition: Triple): void;
}

export interface Updatable {
  update(cameraPosition: Triple, events: Event[]): void;
}

export interface Clickable {
  clickEvent(cameraPosition: Triple): void;
}

export interface OnPressed {
  pressedEvent(cameraPosition: Triple): void;
}

export interface OnReleased {
  releasedEvent(cameraPosition: Triple): void;
}

export interface DoubleClickable {
  doubleClickEvent(cameraPosition: Triple): void;
}
