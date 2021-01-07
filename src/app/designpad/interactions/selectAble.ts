import {Triple} from "../elements/triple";

export interface SelectAble {
  selectEvent(cameraPosition: Triple): boolean;
  readonly isSelected: boolean;
}
