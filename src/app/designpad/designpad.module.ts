import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PadControllerComponent } from './pad-controller/pad-controller.component';
import { DesignpadComponent } from './designpad/designpad.component';
import {TransitionSettingsComponent} from "./pad-controller/settings-panes/transition-settings/transition-settings.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { BasicStateSettingsComponent } from './pad-controller/settings-panes/basic-state-settings/basic-state-settings.component';
import {ModelCheckerComponent} from "../model-checker/model-checker.component";

@NgModule({
  declarations: [PadControllerComponent, DesignpadComponent, TransitionSettingsComponent, BasicStateSettingsComponent, ModelCheckerComponent],
  exports: [
    DesignpadComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DesignpadModule { }
