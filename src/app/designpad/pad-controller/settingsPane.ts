import {Transition} from "../elements/transition";
import {BasicState} from "../elements/basicState";

export interface SettingsPane {
  open: boolean;
  item: Transition | BasicState | null;
}
