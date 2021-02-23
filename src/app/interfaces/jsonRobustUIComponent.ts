import {JsonStates} from "./jsonStates";
import {JsonTransition} from "./jsonTransition";
import {JsonPosition} from "./jsonPosition";
import {JsonComponentStates} from "./jsonComponentStates";

export interface JsonRobustUIComponent {
  label: string;
  type: number;
  initialState?: string;
  states?: JsonStates[];
  components?: JsonComponentStates[],
  events?: string[];
  inputs: string[];
  outputs: string[];
  transitions?: JsonTransition[];
  positions: JsonPosition[]
}
