import {Component, Input, OnInit} from '@angular/core';
import {RobustUiComponent} from "../../entities/robust-ui-component";
import {Subject} from "rxjs";
import {EventDispatcher, EventType} from "../eventDispatcher";
import {ToolTypes} from "../toolings/toolTypes";

@Component({
  selector: 'app-designpad',
  templateUrl: './designpad.component.html',
  styleUrls: ['./designpad.component.scss']
})
export class DesignpadComponent implements OnInit {
  @Input()
  public set component(value: RobustUiComponent) {
    this.activeComponent = value;
  }

  @Input()
  public addComponentStream: Subject<RobustUiComponent>;

  public activeComponent: RobustUiComponent;

  public activeTool: ToolTypes = 'SelectTool';

  constructor() { }

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

  public activateSimulator(): void {
    this.save();
    this.activateTool('SimulatorTool');
  }
}
