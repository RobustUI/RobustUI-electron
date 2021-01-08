import {Clickable, DoubleClickable, Drawable, OnPressed, OnReleased, Updatable} from "./interactions/p5Core";
import {Draggable} from "./interactions/draggable";
import {SelectAble} from "./interactions/selectAble";

export function implementsDrawable(object: any): object is Drawable {
  return 'draw' in object;
}

export function implementsUpdatable(object: any): object is Updatable {
  return 'update' in object;
}

export function implementsClickable(object: any): object is Clickable {
  return 'clickEvent' in object;
}

export function implementsOnPressed(object: any): object is OnPressed {
  return 'pressedEvent' in object;
}

export function implementsOnReleased(object: any): object is OnReleased {
  return 'releasedEvent' in object;
}

export function implementsDraggable(object: any): object is Draggable {
  return object instanceof Draggable;
}

export function implementsDoubleClickable(object: any): object is DoubleClickable {
  return 'doubleClickEvent' in object;
}

export function implementsSelectable(object: any): object is SelectAble {
  return 'selectEvent' in object;
}
