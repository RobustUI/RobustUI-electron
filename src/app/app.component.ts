import {Component} from '@angular/core';
import {ElectronService} from './core/services';
import {TranslateService} from '@ngx-translate/core';
import {AppConfig} from '../environments/environment';
import {RobustUiState} from "./entities/robust-ui-state";
import {RobustUiStateTypes} from "./entities/robust-ui-state-types";
import {RobustUiTransition} from "./entities/robust-ui-transition";
import {RobustUiComponent} from "./entities/robust-ui-component";
import {Subject} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public components: RobustUiComponent[] = [];
  public activeComponent: RobustUiComponent;
  public addComponentStream$ =  new Subject<RobustUiComponent>();
  private _openComponents = new Map<string, RobustUiComponent>();

  public get openComponents(): RobustUiComponent[] {
    return Array.from(this._openComponents.values());
  }

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

  public onDrag(event, component): void {
    event.dataTransfer.setData("text", component.label);
  }

  public onDrop(event: DragEvent): void {
    this.addComponentStream$.next(this.components.find(s => s.label === event.dataTransfer.getData("text")));
  }

  public onDragover(event: DragEvent): void {
    event.preventDefault();
  }

  public openComponent(component: RobustUiComponent): void {
    if (!this._openComponents.has(component.label)) {
      this._openComponents.set(component.label, component.copy());
    }

    this.activeComponent = this._openComponents.get(component.label);
  }

  public closeComponent(component: RobustUiComponent): void {
    this._openComponents.delete(component.label);
    if (this._openComponents.size > 0) {
      this.activeComponent = this._openComponents.values().next().value;
    } else {
      this.activeComponent = null;
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
