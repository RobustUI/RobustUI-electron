import {Component, Input, OnInit} from '@angular/core';
import {RobustUiComponent} from "../entities/robust-ui-component";
import {RobustUiState} from "../entities/robust-ui-state";
import {RobustUiStateTypes} from "../entities/robust-ui-state-types";
import {RobustUiTransition} from "../entities/robust-ui-transition";

export interface ChannelsUsed {
  input: boolean;
  output: boolean;
  label: string;
}


@Component({
  selector: 'app-model-checker',
  templateUrl: './model-checker.component.html',
  styleUrls: ['./model-checker.component.scss']
})
export class ModelCheckerComponent implements OnInit {
  private channels: Map<string, string> = new Map<string, string>();
  private missingChannels: Map<string, string> = new Map<string, string>();
  private deletedChannels: string[] = [];
  private result = "";
  private counter = 0;

  constructor() {
  }

  ngOnInit(): void {
  }

  public generateModel(): void {
    const chatBox: RobustUiComponent = ModelCheckerComponent.demoChatBoxComponent("ChatBox");
    const messageServer: RobustUiComponent = ModelCheckerComponent.demoMessageServerComponent("MessageServer");
    this.createModelForComponent(chatBox);
    this.createModelForComponent(messageServer);

    if (this.shouldGenerateEnvironment()) {
      this.result += this.generateEnvironment();
    }

    console.log(this.result);
  }

  private createModelForComponent(component: RobustUiComponent) {
    component.inputs.forEach(this.createChannelAndDefine.bind(this));
    component.outputs.forEach(this.createChannelAndDefine.bind(this));

    this.result += "\nactive proctype " + component.label + "() {\n";
    this.result += "goto " + component.initialState.label + ";\n";
    component.states.forEach((state: RobustUiState) => {
      this.result += state.label + ":\n";

      component.transitions.forEach((v) => {
        if (v.from === state.label) {
          if (component.inputs.has(v.label)) {
            this.result += this.channels.get(v.label) + "?" + v.label + " -> goto " + v.to + "\n";
          } else if (component.outputs.has(v.label)) {
            this.result += this.channels.get(v.label) + "!" + v.label + " -> goto " + v.to + "\n";
          }
        }
      });
    });
    this.result += "}\n";
  }

  private createChannelAndDefine(input: string) {
    if (!this.channels.has(input)) {
      const channel = input + "Channel";
      this.channels.set(input, channel);
      this.result += "#define " + input + " " + this.counter.toString() + "\n";
      this.result += "chan " + channel + " = [0] of { byte }\n";
      this.counter++;
      
      if (this.missingChannels.has(input)) {
        this.missingChannels.delete(input);
      } else {
        this.missingChannels.set(input, input);
      }
    }
  }

  private shouldGenerateEnvironment() {
    return this.missingChannels.size > 0;
  }

  private generateEnvironment(): string {
    let environment = "";
    this.missingChannels.forEach((channel) => {
      console.log(channel);
    })
    console.log("Generate Environment");
    return environment;
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
