import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {Subject} from "rxjs";
import {Event, EventDispatcher, EventType} from "../eventDispatcher";
import {ToolTypes} from "../toolings/toolTypes";
import {PadControllerComponent} from "../pad-controller/pad-controller.component";
import {SimulatorTrace} from "../../interfaces/simulator-trace";
import {RobustUiStateTypes} from "../../entities/robust-ui-state-types";
import {RobustUiSimpleComponent} from "../../entities/robust-ui-simple-component";
import {DesignPadToRobustUi} from "../converters/DesignPadToRobustUi";
import {RobustUiState} from "../../entities/robust-ui-state";
import {RobustUiSelectiveComponent} from "../../entities/robust-ui-selective-component";
import {ElectronService} from "../../core/services";

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
    this.findUsedActions();
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
  public usedInput: Set<string> = new Set<string>();
  public usedOutput: Set<string> = new Set<string>();

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

  public findUsedActions(updatedComponent = null): void {
    this.clearUsedAction();
    switch (this.activeComponent.type) {
      case RobustUiStateTypes.simpleComponent:
        this.findUsedActionForSimpleComponent(updatedComponent);
        break;
      case RobustUiStateTypes.compositeComponent:
        break;
      case RobustUiStateTypes.selectiveComponent:
        this.findUsedActionForSelectiveComponent();
        break;
    }
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
    const amountOfActionForComponent = this.activeComponent.outputs.size + this.activeComponent.inputs.size;
    const amountOfUsedActionsForComponent = this.usedInput.size + this.usedOutput.size;
    if (amountOfActionForComponent !== amountOfUsedActionsForComponent) {
      alert("You have some inputs or outputs that you do not use");
    }
    EventDispatcher.getInstance().emit({type: EventType.SAVE_COMPONENT, data: this.activeComponent});
  }

  public updateInitialValue(label: string): void {
    if (this.activeComponent.type === RobustUiStateTypes.simpleComponent) {
      (this.activeComponent as RobustUiSimpleComponent).initialState = (this.activeComponent as RobustUiSimpleComponent).states.get(label);
    }
    this.save();
    this.padController.updateComponent(this.activeComponent);
  }

  public updateDefaultCase(event: string): void {
    if (this.activeComponent.type === RobustUiStateTypes.selectiveComponent) {
      const comp = this.activeComponent as RobustUiSelectiveComponent;
      if (comp.initialCase != '') {
      comp.cases.find(e => e.label === comp.initialCase).guard = "";
      }
      comp.initialCase = event;
      comp.cases.find(e => e.label === event).guard = "default";

      EventDispatcher.getInstance().emit({type: EventType.REBUILD_AND_SAVE, data: comp});
    }
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

  private findUsedActionForSelectiveComponent() {
    const castedComponent = this.activeComponent as RobustUiSelectiveComponent;
    this.usedInput.add(castedComponent.observer.input);
  }

  private findUsedActionForSimpleComponent(updatedComponent = null) {
    let castedComponent;
    if (updatedComponent != null) {
      castedComponent = updatedComponent;
    } else {
      castedComponent = this.activeComponent as RobustUiSimpleComponent;
    }

    castedComponent.transitions.forEach(e => {
      if (castedComponent.inputs.has(e.label)) {
        this.usedInput.add(e.label);
      } else if (castedComponent.outputs.has(e.label)) {
        this.usedOutput.add(e.label);
      }
    });
  }

  private listenForComponentChanges() {
    EventDispatcher.getInstance().stream().subscribe(event => {
      if (event.type === EventType.CHANGE_COMPONENT) {
        this.activeComponent = DesignPadToRobustUi.convert(event.data, this.activeComponent);
      } else if (event.type === EventType.RENAME_STATE) {
        this.updateStateName(event);
      } else if (event.type === EventType.RENAME_ACTION) {
        this.usedInput.delete(event.data.prev.slice(0, -1));
        this.usedInput.add(event.data.new.slice(0, -1));
      }
    });
  }

  private updateStateName(event: Event) {
    const state = event.data.newState as RobustUiState;
    const component = this.activeComponent as RobustUiSimpleComponent;
    component.states.set(event.data.previousName, state);
    if (event.data.previousName === component.initialState.label) {
      component.initialState = state;
    }
    this.activeComponent = component;
    this.save();
  }

  private clearUsedAction() {
    this.usedInput.clear();
    this.usedOutput.clear();
  }
}
