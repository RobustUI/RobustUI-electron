import {Component, Input} from '@angular/core';
import {RobustUiComponent} from "../entities/robust-ui-component";
import {RobustUiState} from "../entities/robust-ui-state";
import {ElectronService} from "../core/services";
import {BehaviorSubject} from "rxjs";
import {RobustUiSimpleComponent} from "../entities/robust-ui-simple-component";
import {RobustUiStateTypes} from "../entities/robust-ui-state-types";
import {RobustUiCompositeComponent} from "../entities/robust-ui-composite-component";
import {ComponentRepository} from "../componentRepository";
import {RobustUiSelectiveComponent} from "../entities/robust-ui-selective-component";

export interface ChannelWithSymbol {
  label: string;
  symbol: string;
}

@Component({
  selector: 'app-model-checker',
  templateUrl: './model-checker.component.html',
  styleUrls: ['./model-checker.component.scss']
})
export class ModelCheckerComponent {
  @Input()
  public component: RobustUiComponent;
  public modelCheckerResult: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor(
    private electronService: ElectronService,
  ) {
    this.modelCheckerResult = this.electronService.modelCheckerResult;
  }

  public verifyComponent(): void {
    this.electronService.executeSpinFlow(`component${this.component.label}.json`);
  }

  public close(): void {
    this.modelCheckerResult.next("");
  }
}
