import {RobustUiComponent} from "./entities/robust-ui-component";
import {ApplicationRef, Injectable, OnDestroy} from "@angular/core";
import {BehaviorSubject, Observable, Subject, Subscription} from "rxjs";
import {UpdateComponent} from "./designpad/designpad/designpad.component";
import {ElectronService} from "./core/services";
import {RobustUiStateTypes} from "./entities/robust-ui-state-types";
import {SerializerFactory} from "./serializers/SerializerFactory";
import {ComponentFactory} from "./factories/ComponentFactory";

@Injectable({
  providedIn: "root"
})
export class ComponentRepository implements OnDestroy{
  private allComponents$ = new BehaviorSubject<RobustUiComponent[]>([]);
  private components: Map<string, RobustUiComponent>;
  private singleComponentObservableMap: Map<string, BehaviorSubject<RobustUiComponent>>;
  private JSONPath;
  private sub: Subscription;

  constructor(private electronService: ElectronService, private appRef: ApplicationRef) {
    this.components = new Map<string, RobustUiComponent>();
    this.singleComponentObservableMap = new Map<string, BehaviorSubject<RobustUiComponent>>();
    this.sub = this.electronService.JSONPath.subscribe(path => {
      if (path !== "") {
        this.JSONPath = path;
        this.retrieveComponentsFromPath();
        appRef.tick();
      }
    });
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
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
    this.electronService.writeComponentToJSON(component, this.JSONPath);
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
    this.retrieveComponentsFromPath();
    return this.allComponents$.asObservable();
  }

  public factory(type: RobustUiStateTypes, label: string): any {
    return ComponentFactory.forType(type).build(label);
  }

  private retrieveComponentsFromPath(): void {
    if (this.JSONPath == null) {
      return;
    }
    const components = this.electronService.readAllProject(this.JSONPath);
    components.forEach(component => {
      const comp = SerializerFactory.forType(component.type).fromJSON(component);
      if (comp != null) {
        this.save(comp.label, comp)
        //this.components.set(comp.label, comp);
      } else {
        console.error("Something went wrong while trying to parse the component: ", component);
      }
    });
    this.allComponents$.next(Array.from(this.components.values()));
  }
}
