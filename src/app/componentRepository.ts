import {RobustUiComponent} from "./entities/robust-ui-component";
import {RobustUiState} from "./entities/robust-ui-state";
import {RobustUiStateTypes} from "./entities/robust-ui-state-types";
import {RobustUiTransition} from "./entities/robust-ui-transition";
import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ComponentRepository {
  private components: Map<string, RobustUiComponent>;

  private allComponents$ = new BehaviorSubject<RobustUiComponent[]>([]);

  private singleComponentObservableMap: Map<string, BehaviorSubject<RobustUiComponent>>;

  constructor() {
    this.components = new Map<string, RobustUiComponent>();
    this.singleComponentObservableMap = new Map<string, BehaviorSubject<RobustUiComponent>>();
    this.save('First', this.demoComponent('First'));
    this.save('Second', this.demoComponent('Second'));
  }


  public get(name: string): Observable<RobustUiComponent> {
    if (!this.singleComponentObservableMap.has(name)) {
      this.singleComponentObservableMap.set(name, new BehaviorSubject(this.components.get(name)));
    }
    return this.singleComponentObservableMap.get(name).asObservable();
  }

  public save(name: string, component: RobustUiComponent): void {
    this.components.set(name, component);

    if (this.singleComponentObservableMap.has(name)) {
      this.singleComponentObservableMap.get(name).next(component);
    }
    this.allComponents$.next(Array.from(this.components.values()));
  }

  public create(componentName: string): void {
    this.components.set(componentName, RobustUiComponent.factory(componentName));
    this.allComponents$.next(Array.from(this.components.values()));
  }

  public getAll(): Observable<RobustUiComponent[]> {
    this.allComponents$.next(Array.from(this.components.values()));

    return this.allComponents$.asObservable();
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

    const positions = new Map<string, {x: number, y:number}>();

    positions.set(label+'_A', {x: 40, y:200});
    positions.set(label+'_B', {x: 100, y:40});

    return new RobustUiComponent(
      label,
      new Set(states),
      label+'_A',
      new Set(events),
      new Set(inputs),
      new Set(outputs),
      new Set(transitions),
      positions
    );
  }
}
