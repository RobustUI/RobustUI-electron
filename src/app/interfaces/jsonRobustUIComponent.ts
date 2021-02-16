import {JsonStates} from "./jsonStates";
import {JsonTransition} from "./jsonTransition";
import {JsonPosition} from "./jsonPosition";

export interface JsonRobustUIComponent {
  label: string;
  initialState: string;
  states: JsonStates[];
  events: string[];
  inputs: string[];
  outputs: string[];
  transitions: JsonTransition[];
  positions: JsonPosition[]
}
