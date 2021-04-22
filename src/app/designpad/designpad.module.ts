import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PadControllerComponent} from './pad-controller/pad-controller.component';
import {DesignpadComponent} from './designpad/designpad.component';
import {TransitionSettingsComponent} from "./pad-controller/settings-panes/transition-settings/transition-settings.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BasicStateSettingsComponent} from './pad-controller/settings-panes/basic-state-settings/basic-state-settings.component';
import {ModelCheckerComponent} from "../model-checker/model-checker.component";
import {ModalComponent} from "../modals/modal/modal.component";
import {SimulatorTraceComponent} from "../simulator-trace/simulator-trace.component";
import {SelectComponentComponent} from "./select-component/select-component.component";
import { GuardSettingsComponent } from './pad-controller/settings-panes/guard-settings/guard-settings.component';
import {AppModule} from "../app.module";
import {CompilerWidgetComponent} from "../compiler-widget/compiler-widget.component";
import {HIGHLIGHT_OPTIONS, HighlightModule} from "ngx-highlightjs";
import {ClipboardModule} from "ngx-clipboard";

@NgModule({
  declarations: [
    PadControllerComponent,
    DesignpadComponent,
    TransitionSettingsComponent,
    BasicStateSettingsComponent,
    ModelCheckerComponent,
    CompilerWidgetComponent,
    ModalComponent,
    SimulatorTraceComponent,
    SelectComponentComponent,
    GuardSettingsComponent
  ],
  exports: [
    DesignpadComponent,
  ],
  imports: [
    ClipboardModule,
    HighlightModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        fullLibraryLoader: () => import('highlight.js'),
      }
    }
  ]
})
export class DesignpadModule {
}
