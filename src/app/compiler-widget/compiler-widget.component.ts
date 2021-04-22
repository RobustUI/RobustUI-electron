import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElectronService} from "../core/services";
import {RobustUiComponent} from "../entities/robust-ui-component";
import {BehaviorSubject, Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-compiler-widget',
  templateUrl: './compiler-widget.component.html',
  styleUrls: ['./compiler-widget.component.scss']
})
export class CompilerWidgetComponent {
  @Input()
  public activeComponent: RobustUiComponent;

  public compilerResult: BehaviorSubject<string> = null;
  constructor(private electronService: ElectronService) {
    this.compilerResult = this.electronService.compilerResult;
  }


  public codeGeneration(): void {
    this.electronService.executeCompiler("typescript", `component${this.activeComponent.label}.json`);
  }

  public close() {
    this.compilerResult.next("");
  }
}
