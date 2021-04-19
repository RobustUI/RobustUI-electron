import {Tool} from "./tool";
import {
  implementsClickable,
  implementsDoubleClickable,
  implementsDraggable,
  implementsOnPressed,
  implementsOnReleased
} from "../implements";
import {Triple} from "../elements/triple";
import {EventDispatcher, EventType} from "../eventDispatcher";
import {ToolTypes} from "./toolTypes";
import {Transition} from "../elements/transition";

export class SelectTool extends Tool {
  public readonly name: ToolTypes = 'SelectTool';
  public mouseClicked(elements: any[], cameraPosition: Triple): void {
    elements.filter((e) => implementsClickable(e)).forEach(e => e.clickEvent(cameraPosition));
  }

  public mousePressed(elements: any[], cameraPosition: Triple): void {
    elements.filter((e) => implementsOnPressed(e)).forEach(e => e.pressedEvent(cameraPosition));
  }

  public mouseReleased(elements: any[], cameraPosition: Triple): void {
    elements.filter((e) => implementsOnReleased(e)).forEach(e => e.releasedEvent());
  }

  public mouseDragged(elements: any[], cameraPosition: Triple): void {
    elements.filter((e) => implementsDraggable(e)).forEach(e => e.dragEvent(cameraPosition));

    const trans = elements.find((e) => (e instanceof Transition) && e.isSelected);
    if (trans != null) {
      trans.isDragged(cameraPosition);
    }
  }

  public doubleClicked(elements: any[], cameraPosition: Triple): void {
    const el = elements.filter((e) => implementsDoubleClickable(e)).find(e =>e.doubleClickEvent(cameraPosition));

    if(el != null) {
      EventDispatcher.getInstance().emit({type: EventType.SHOW_SETTINGS, data: el});
    }

  }
}
