import {Component, Input, OnInit} from '@angular/core';
import {RobustUiComponent} from "../entities/robust-ui-component";
import {RobustUiState} from "../entities/robust-ui-state";
import {RobustUiStateTypes} from "../entities/robust-ui-state-types";
import {RobustUiTransition} from "../entities/robust-ui-transition";

@Component({
  selector: 'app-model-checker',
  templateUrl: './model-checker.component.html',
  styleUrls: ['./model-checker.component.scss']
})
export class ModelCheckerComponent implements OnInit {
  private channels: Map<string, string> = new Map<string, string>();

  constructor() {
  }

  ngOnInit(): void {
  }

  public generateModel(): void {
    const chatBox: RobustUiComponent = ModelCheckerComponent.demoChatBoxComponent("ChatBox");
    const messageServer: RobustUiComponent = ModelCheckerComponent.demoMessageServerComponent("MessageServer");
    let model = this.createModelForComponent(chatBox);
    model += this.createModelForComponent(messageServer);
    console.log(model);
  }

  private createModelForComponent(component: RobustUiComponent): string {
    let result = "";
    let counter = 0;
    component.inputs.forEach((input: string) => {
      if (!this.channels.has(input)) {
        const channel = input + "Channel";
        this.channels.set(input, channel);
        result += "#define " + input + " " + counter.toString() + "\n";
        result += "chan " + channel + " = [0] of { byte }\n";
        counter++;
      }
    });
    component.outputs.forEach((input: string) => {
      if (!this.channels.has(input)) {
        const channel = input + "Channel";
        this.channels.set(input, channel);
        result += "#define " + input + " " + counter.toString() + "\n";
        result += "chan " + channel + " = [0] of { byte }\n";
        counter++;
      }
    });

    result += "active proctype " + component.label + "() {\n";
    result += "goto " + component.initialState.label + ";\n";
    component.states.forEach((state: RobustUiState) => {
      result += state.label + ":\n";

      component.transitions.forEach((v) => {
        if (v.from === state.label) {
          if (component.inputs.has(v.label)) {
            result += this.channels.get(v.label) + "?" + v.label + " -> goto " + v.to + "\n";
          } else if (component.outputs.has(v.label)) {
            result += this.channels.get(v.label) + "!" + v.label +" -> goto " + v.to + "\n";
          }
        }
      });
    });
    result += "}\n";
    return result;
  }

  private static demoChatBoxComponent(label: string): RobustUiComponent {
    const states: RobustUiState[] = [
      {label: label + '_Compose_Message', type: RobustUiStateTypes.baseState},
      {label: label + '_Loading', type: RobustUiStateTypes.baseState}
    ];

    const events: string[] = [];
    const inputs: string[] = [
      'ack'
    ];
    const outputs: string[] = [
      'msg'
    ];

    const transitions: RobustUiTransition[] = [
      {from: label + '_Compose_Message', label: 'msg', to: label + '_Loading'},
      {from: label + '_Loading', label: 'ack', to: label + '_Compose_Message'}
    ];

    return new RobustUiComponent(
      label,
      new Set(states),
      label + '_Compose_Message',
      new Set(events),
      new Set(inputs),
      new Set(outputs),
      new Set(transitions)
    );
  }

  private static demoMessageServerComponent(label: string): RobustUiComponent {
    const states: RobustUiState[] = [
      {label: label + '_WaitForMessage', type: RobustUiStateTypes.baseState},
      {label: label + '_Loading', type: RobustUiStateTypes.baseState}
    ];

    const events: string[] = [];
    const inputs: string[] = [
      'msg'
    ];
    const outputs: string[] = [
      'ack'
    ];

    const transitions: RobustUiTransition[] = [
      {from: label + '_WaitForMessage', label: 'msg', to: label + '_Loading'},
      {from: label + '_Loading', label: 'ack', to: label + '_WaitForMessage'}
    ];

    return new RobustUiComponent(
      label,
      new Set(states),
      label + '_WaitForMessage',
      new Set(events),
      new Set(inputs),
      new Set(outputs),
      new Set(transitions)
    );
  }

}
