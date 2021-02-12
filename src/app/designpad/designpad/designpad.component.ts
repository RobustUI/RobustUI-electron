import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {Subject} from "rxjs";
import {EventDispatcher, EventType} from "../eventDispatcher";
import {ToolTypes} from "../toolings/toolTypes";
import {PadControllerComponent} from "../pad-controller/pad-controller.component";
import {SimulatorTrace} from "../../interfaces/simulator-trace";

export interface UpdateComponent {
  newLabel: string;
  component: RobustUiComponent
}

@Component({
  selector: 'app-designpad',
  templateUrl: './designpad.component.html',
  styleUrls: ['./designpad.component.scss']
})
export class DesignpadComponent implements OnInit {
  @Input()
  public set component(value: RobustUiComponent) {
    this.activeComponent = value;
    this.tempComponentLabel = value.label;
  }

  @ViewChild(PadControllerComponent) padController: PadControllerComponent;

  @Output()
  public updateComponentLabel: EventEmitter<UpdateComponent> = new EventEmitter<UpdateComponent>();

  @Input()
  public addComponentStream: Subject<RobustUiComponent>;

  public simulatorTrance: Subject<SimulatorTrace> = new Subject<SimulatorTrace>();
  public activeComponent: RobustUiComponent;
  public tempComponentLabel;
  public activeTool: ToolTypes = 'SelectTool';

  constructor() {
  }

  public ngOnInit(): void {
    this.addComponentStream.subscribe((newComp: RobustUiComponent) => {
      this.activeComponent.states.set(newComp.label, newComp);
    });
  }

  public activateTool(toolName: ToolTypes): void {
    this.activeTool = toolName;
  }

  public addNewInput(input: string): void {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.length > 0 && !this.activeComponent.inputs.has(trimmed) && !this.activeComponent.outputs.has(trimmed)) {
      this.activeComponent.inputs.add(trimmed);
    }
  }

  public addNewOutput(output: string): void {
    const trimmed = output.trim().toLowerCase();
    if (trimmed.length > 0 && !this.activeComponent.inputs.has(trimmed) && !this.activeComponent.outputs.has(trimmed)) {
      this.activeComponent.outputs.add(trimmed);
    }
  }

  public save(): void {
    EventDispatcher.getInstance().emit({type: EventType.SAVE_COMPONENT, data: this.activeComponent});
  }

  public updateInitialValue(label: string): void {
    this.activeComponent.initialState = this.activeComponent.states.get(label);
    this.padController.updateComponent(this.activeComponent);
  }

  public activateSimulator(): void {
    this.save();
    this.activateTool('SimulatorTool');
  }

  public updateValue(event: any): void {
    if (event.key === "Enter") {
      this.updateComponentLabel.emit({newLabel: this.tempComponentLabel, component: this.activeComponent});
    }
  }
}
