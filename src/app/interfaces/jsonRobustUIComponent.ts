import {JsonStates} from "./jsonStates";
import {JsonTransition} from "./jsonTransition";
import {JsonPosition} from "./jsonPosition";
import {JsonComponentStates} from "./jsonComponentStates";
import {JsonSelectiveCase} from "./jsonSelectiveCase";
import {JsonSelectiveObserver} from "./JsonSelectiveObserver";

export interface JsonRobustUIComponent {
  label: string;
  type: number;
  initialState?: string;
  states?: JsonStates[];
  components?: JsonComponentStates[],
  cases?: JsonSelectiveCase[];
  observer?: JsonSelectiveObserver;
  events?: string[];
  inputs: string[];
  outputs: string[];
  transitions?: JsonTransition[];
  positions: JsonPosition[]
}
