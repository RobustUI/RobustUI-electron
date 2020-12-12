export interface Drawable {
  draw(zoomLevel: number): void;
}

export interface Updatable {
  update(): void;
}

export interface Clickable {
  clickEvent(): void;
}

export interface OnPressed {
  pressedEvent(): void;
}

export interface OnReleased {
  releasedEvent(): void;
}

export interface DoubleClickable {
  doubleClickEvent(): void;
}
