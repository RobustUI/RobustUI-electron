import {Component} from '@angular/core';
import {ElectronService} from './core/services';
import {TranslateService} from '@ngx-translate/core';
import {AppConfig} from '../environments/environment';
import {RobustUiState} from "./entities/robust-ui-state";
import {RobustUiStateTypes} from "./entities/robust-ui-state-types";
import {RobustUiTransition} from "./entities/robust-ui-transition";
import {RobustUiComponent} from "./entities/robust-ui-component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public components: RobustUiComponent[] = [];
  public activeComponent: RobustUiComponent;
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService
  ) {
    this.components.push(this.demoComponent("First"));
    this.components.push(this.demoComponent("Second"));
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  private demoComponent(label: string): RobustUiComponent {
    const states: RobustUiState[] = [
      {label: label+'_A', type: RobustUiStateTypes.baseState},
      {label: label+'_B', type: RobustUiStateTypes.baseState}
    ];

    const events: string[] = [];
    const inputs: string[] = [
      'awk'
    ];
    const outputs: string[] = [
      'msg'
    ];

    const transitions: RobustUiTransition[] = [
      {from: label+'_A', label: 'msg', to: label+'_B'},
      {from: label+'_B', label: 'awk', to: label+'_A'}
    ];

    return new RobustUiComponent(
      label,
      new Set(states),
      label+'_A',
      new Set(events),
      new Set(inputs),
      new Set(outputs),
      new Set(transitions)
    );
  }
}
