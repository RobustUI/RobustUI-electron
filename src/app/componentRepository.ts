import {RobustUiComponent} from "./entities/robust-ui-component";
import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {UpdateComponent} from "./designpad/designpad/designpad.component";
import {ElectronService} from "./core/services";

@Injectable({
  providedIn: "root"
})
export class ComponentRepository {
  private components: Map<string, RobustUiComponent>;

  private allComponents$ = new BehaviorSubject<RobustUiComponent[]>([]);

  private singleComponentObservableMap: Map<string, BehaviorSubject<RobustUiComponent>>;

  constructor(private electronService: ElectronService) {
    this.components = new Map<string, RobustUiComponent>();
    this.singleComponentObservableMap = new Map<string, BehaviorSubject<RobustUiComponent>>();
    const components = this.electronService.readAllJSONFilesInFolder("src/app/JSON");

    components.forEach(component => {
      this.save(component.label, RobustUiComponent.fromJSON(component));
    });
  }

  public get(name: string): Observable<RobustUiComponent> {
    if (!this.singleComponentObservableMap.has(name)) {
      this.singleComponentObservableMap.set(name, new BehaviorSubject(this.components.get(name)));
    }
    return this.singleComponentObservableMap.get(name).asObservable();
  }

  private saveToFile(component: RobustUiComponent): void {
    this.electronService.writeComponentToJSON(component, "src/app/JSON");
  }

  public save(name: string, component: RobustUiComponent): void {
    this.components.set(name, component);
    this.saveToFile(component);
    if (this.singleComponentObservableMap.has(name)) {
      this.singleComponentObservableMap.get(name).next(component);
    }
    this.allComponents$.next(Array.from(this.components.values()));
  }

  public create(componentName: string): void {
    this.components.set(componentName, RobustUiComponent.factory(componentName));
    this.allComponents$.next(Array.from(this.components.values()));
  }

  public update(component: UpdateComponent): void {
    this.components.delete(component.component.label);
    component.component.label = component.newLabel;
    this.components.set(component.newLabel, component.component);
    this.allComponents$.next(Array.from(this.components.values()));
  }

  public getAll(): Observable<RobustUiComponent[]> {
    this.allComponents$.next(Array.from(this.components.values()));

    return this.allComponents$.asObservable();
  }
}
