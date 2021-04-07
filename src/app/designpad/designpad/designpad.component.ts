import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {Subject} from "rxjs";
import {EventDispatcher, EventType} from "../eventDispatcher";
import {ToolTypes} from "../toolings/toolTypes";
import {PadControllerComponent} from "../pad-controller/pad-controller.component";
import {SimulatorTrace} from "../../interfaces/simulator-trace";
import {RobustUiStateTypes} from "../../entities/robust-ui-state-types";
import {RobustUiSimpleComponent} from "../../entities/robust-ui-simple-component";
import {DesignPadToRobustUi} from "../converters/DesignPadToRobustUi";
import {RobustUiState} from "../../entities/robust-ui-state";

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
  public selectedRenameAction = "";
  public tempActionName = "";

  constructor() {
  }

  public ngOnInit(): void {
    this.addComponentStream.subscribe((newComp: RobustUiComponent) => {
      if (this.activeComponent.type === RobustUiStateTypes.simpleComponent) {
        (this.activeComponent as RobustUiSimpleComponent).states.set(newComp.label, newComp);
      }
    });
    this.listenForComponentChanges();
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
    if (this.activeComponent.type === RobustUiStateTypes.simpleComponent) {
      (this.activeComponent as RobustUiSimpleComponent).initialState = (this.activeComponent as RobustUiSimpleComponent).states.get(label);
    }
    this.save();
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

  public onDoubleClickAction(action: string): void {
    this.selectedRenameAction = action;
    this.tempActionName = action;
  }

  public onKeyDownAction(event: any, isOutput: boolean): void {
    if (event.key === "Enter") {
      if (this.tempActionName.trim().length === 0) {
        return;
      }
      if (isOutput) {
        this.activeComponent.outputs.delete(this.selectedRenameAction);
        this.activeComponent.outputs.add(this.tempActionName.toLowerCase());
        EventDispatcher.getInstance().emit({
          type: EventType.RENAME_ACTION,
          data: {prev: this.selectedRenameAction + "!", new: this.tempActionName.toLowerCase() + "!"}
        });
      } else {
        this.activeComponent.inputs.delete(this.selectedRenameAction);
        this.activeComponent.inputs.add(this.tempActionName.toLowerCase());
        EventDispatcher.getInstance().emit({
          type: EventType.RENAME_ACTION,
          data: {prev: this.selectedRenameAction + "?", new: this.tempActionName.toLowerCase() + "?"}
        });
      }
      this.selectedRenameAction = "";
      this.tempActionName = "";
    }
  }

  public onMouseDownAction(event: MouseEvent, action: string, isOutput: boolean): void {
    if (event.button === 2) {
      if (isOutput) {
        if (confirm(`Do you want to delete ${action} output?`)) {
          EventDispatcher.getInstance().emit({
            type: EventType.DELETE_ACTION,
            data: action + "!"
          });
          this.activeComponent.outputs.delete(action);
        }
      } else {
        if (confirm(`Do you want to delete ${action} input?`)) {
          EventDispatcher.getInstance().emit({
            type: EventType.DELETE_ACTION,
            data: action + "?"
          });
          this.activeComponent.inputs.delete(action);
        }
      }
    }
  }

  private listenForComponentChanges() {
    EventDispatcher.getInstance().stream().subscribe(event => {
      if (event.type === EventType.CHANGE_COMPONENT) {
        this.activeComponent = DesignPadToRobustUi.convert(event.data, this.activeComponent);
      } else if (event.type === EventType.RENAME_STATE) {
        const state = event.data.newState as RobustUiState;
        const component = this.activeComponent as RobustUiSimpleComponent;
        component.states.set(event.data.previousName, state);
        if (event.data.previousName === component.initialState.label) {
          component.initialState = state;
        }
        this.activeComponent = component;
        this.save();
      }
    });
  }
}
