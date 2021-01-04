import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PadControllerComponent } from './pad-controller/pad-controller.component';
import { DesignpadComponent } from './designpad/designpad.component';
import {ModelCheckerComponent} from "../model-checker/model-checker.component";

@NgModule({
  declarations: [PadControllerComponent, DesignpadComponent, ModelCheckerComponent],
  exports: [
    DesignpadComponent,
  ],
  imports: [
    CommonModule
  ]
})
export class DesignpadModule { }
