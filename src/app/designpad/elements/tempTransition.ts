import {Transition} from "./transition";
import * as P5 from 'p5';
import {BasicState} from "./basicState";
import {Triple} from "./triple";


export class TempTransition extends Transition {
  constructor(pad: P5, from: BasicState) {
    super(pad, "", from, from);
  }

  protected calculatePositions(cameraPosition: Triple) {
    super.calculatePositions(cameraPosition);
    this.connection.to.x = (this.pad.mouseX / cameraPosition.z) - cameraPosition.x;
    this.connection.to.y = (this.pad.mouseY / cameraPosition.z) - cameraPosition.y;
  }
}
