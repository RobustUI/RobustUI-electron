import {Component} from '@angular/core';
import {ElectronService} from './core/services';
import {TranslateService} from '@ngx-translate/core';
import {AppConfig} from '../environments/environment';
import {RobustUiComponent} from "./entities/robust-ui-component";
import {Observable, Subject} from "rxjs";
import {ComponentRepository} from "./componentRepository";
import {UpdateComponent} from "./designpad/designpad/designpad.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public components$: Observable<RobustUiComponent[]>;
  public activeComponent$: Observable<RobustUiComponent>;
  public addComponentStream$ = new Subject<RobustUiComponent>();
  public model = false;
  private _openComponents = new Map<string, Observable<RobustUiComponent>>();

  public get openComponents(): string[] {
    return Array.from(this._openComponents.keys());
  }

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private componentRepository: ComponentRepository
  ) {
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

    this.components$ = this.componentRepository.getAll();
  }

  public onDrag(event, component): void {
    event.dataTransfer.setData("text", component.label);
  }

  public onDrop(event: DragEvent): void {
    // this.addComponentStream$.next(this.components$.find(s => s.label === event.dataTransfer.getData("text")));
  }

  public onDragover(event: DragEvent): void {
    event.preventDefault();
  }

  public openComponent(name: string): void {
    if (!this._openComponents.has(name)) {
      this._openComponents.set(name, this.componentRepository.get(name));
    }

    this.activeComponent$ = this._openComponents.get(name);
  }

  public closeComponent(name: string): void {
    this._openComponents.delete(name);
    if (this._openComponents.size > 0) {
      this.activeComponent$ = this._openComponents.values().next().value;
    } else {
      this.activeComponent$ = null;
    }
  }

  public openModal(): void {
    this.model = true;
  }

  public createComponent(newComponent: {name: string, type: number}): void {
    this.componentRepository.create(newComponent.name, newComponent.type);
    this.closeModal();
  }

  public closeModal(): void {
    this.model = false;
  }

  public updateComponent(component: UpdateComponent): void {
    this._openComponents.delete(component.component.label);
    this.componentRepository.update(component);
    this.openComponent(component.newLabel);
  }
}
