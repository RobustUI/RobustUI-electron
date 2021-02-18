import {RobustUiComponent} from "./entities/robust-ui-component";
import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {UpdateComponent} from "./designpad/designpad/designpad.component";
import {ElectronService} from "./core/services";
import {RobustUiStateTypes} from "./entities/robust-ui-state-types";
import {SerializerFactory} from "./serializers/SerializerFactory";
import {RobustUiSimpleComponent} from "./entities/robust-ui-simple-component";
import {ComponentFactory} from "./factories/ComponentFactory";

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
    const components = this.electronService.readAllProject("src/app/JSON");

    components.forEach(component => {
      const comp =  SerializerFactory.forType(component.type).fromJSON(component);
      if (comp != null) {
        this.save(component.label, comp);
      } else {
        console.error("Something went wrong while trying to parse a component", component);
      }
    });

  }

  public get(name: string): Observable<RobustUiComponent> {
    if (!this.singleComponentObservableMap.has(name)) {
      this.singleComponentObservableMap.set(name, new BehaviorSubject(this.components.get(name)));
    }
    return this.singleComponentObservableMap.get(name).asObservable();
  }

  public get snapshot(): RobustUiComponent[] {
    return Array.from(this.components.values());
  }

  private saveToFile(component: RobustUiComponent): void {
    this.electronService.writeComponentToJSON((component as RobustUiSimpleComponent), "src/app/JSON");
  }

  public save(name: string, component: RobustUiComponent): void {
    this.components.set(name, component);
    this.saveToFile(component);
    if (this.singleComponentObservableMap.has(name)) {
      this.singleComponentObservableMap.get(name).next(component);
    }
    this.allComponents$.next(Array.from(this.components.values()));
  }

  public create(componentName: string, type: number): void {
    this.components.set(componentName, this.factory(type, componentName));
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

  public factory(type: RobustUiStateTypes, label: string): any {
    return ComponentFactory.forType(type).build(label);
  }
}
