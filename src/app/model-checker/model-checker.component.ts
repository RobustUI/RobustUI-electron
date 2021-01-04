import {Component, Input} from '@angular/core';
import {RobustUiComponent} from "../entities/robust-ui-component";
import {RobustUiState} from "../entities/robust-ui-state";
import {RobustUiStateTypes} from "../entities/robust-ui-state-types";
import {RobustUiTransition} from "../entities/robust-ui-transition";
import {ElectronService} from "../core/services";
import {BehaviorSubject} from "rxjs";

export interface ChannelWithSymbol {
  label: string;
  symbol: string;
}

@Component({
  selector: 'app-model-checker',
  templateUrl: './model-checker.component.html',
  styleUrls: ['./model-checker.component.scss']
})
export class ModelCheckerComponent {
  public subject: BehaviorSubject<string> = new BehaviorSubject<string>("");
  @Input()
  public component: RobustUiComponent;

  private channels: Map<string, string> = new Map<string, string>();
  private missingChannels: Map<string, ChannelWithSymbol> = new Map<string, ChannelWithSymbol>();
  private result = "";
  private counter = 0;

  constructor(private electronService: ElectronService) {
    this.subject = this.electronService.event;
  }

  public generateModel(): void {
    this.createModelForComponent(this.component);

    if (this.shouldGenerateEnvironment()) {
      this.result += this.generateEnvironment();
    }
    console.log(this.result);
    this.electronService.writeModelToFile(this.result);
    this.electronService.executeSpinFlow();
  }

  private createModelForComponent(component: RobustUiComponent) {
    component.inputs.forEach(this.createChannelAndDefine.bind(this));
    component.outputs.forEach(this.createChannelAndDefine.bind(this));

    this.result += "\nactive proctype " + component.label + "() {\n";
    this.result += "goto " + component.initialState.label + ";\n";

    component.states.forEach((state: RobustUiState) => {
      this.result += state.label + ":\n";
      const transitions: string[] = [];
      component.transitions.forEach((v) => {
        if (v.from === state.label) {
          if (component.inputs.has(v.label)) {
            transitions.push(this.channels.get(v.label) + "?" + v.label + " -> goto " + v.to + "\n");
            this.addOrRemoveMissingChannel(v.label, true);
          } else if (component.outputs.has(v.label)) {
            transitions.push(this.channels.get(v.label) + "!" + v.label + " -> goto " + v.to + "\n");
            this.addOrRemoveMissingChannel(v.label, false);
          } else {
            transitions.push("goto " + v.to + "\n");
          }
        }
      });
      this.generateTransition(transitions);
    });
    this.result += "}\n";
  }

  private generateTransition(transitions: string[]) {
    if (transitions.length > 1) {
      this.result += "if\n";
      transitions.forEach((value) => {
        this.result += ":: " + value;
      });
      this.result += "fi\n";
    } else {
      transitions.forEach((value) => {
        this.result += value;
      });
    }
  }

  private addOrRemoveMissingChannel(channel: string, send: boolean) {
    if (this.missingChannels.has(channel)) {
      this.missingChannels.delete(channel);
    } else {
      if (send) {
        this.missingChannels.set(channel, {
          label: channel,
          symbol: "!"
        });
      } else {
        this.missingChannels.set(channel, {
          label: channel,
          symbol: "?"
        });
      }
    }
  }

  private createChannelAndDefine(input: string) {
    if (!this.channels.has(input)) {
      const channel = input + "Channel";
      this.channels.set(input, channel);
      this.result += "#define " + input + " " + this.counter.toString() + "\n";
      this.result += "chan " + channel + " = [0] of { byte }\n";
      this.counter++;
    }
  }

  private shouldGenerateEnvironment() {
    return this.missingChannels.size > 0;
  }

  private generateEnvironment(): string {
    let environment = "\nactive proctype environment() {\nend:\nif\n";
    this.missingChannels.forEach((channel) => {
      environment += ":: " + this.channels.get(channel.label) + channel.symbol + channel.label + " -> goto end;\n";
    });
    environment += "fi\n}\n";

    return environment;
  }

  // For testing purposes. Do not remove until everything is ready for deployment
  private static demoChatBoxComponent(label: string): RobustUiComponent {
    const states: RobustUiState[] = [
      {label: label + '1', type: RobustUiStateTypes.baseState},
      {label: label + '2', type: RobustUiStateTypes.baseState},
      {label: label + '3', type: RobustUiStateTypes.baseState}
    ];

    const events: string[] = [
      'b'
    ];
    const inputs: string[] = [
      'a',
    ];
    const outputs: string[] = [
      'c'
    ];

    const transitions: RobustUiTransition[] = [
      {from: label + '1', label: 'a', to: label + '2'},
      {from: label + '1', label: 'b', to: label + '3'},
      {from: label + '2', label: 'c', to: label + '3'},
    ];

    return new RobustUiComponent(
      label,
      new Set(states),
      label + '1',
      new Set(events),
      new Set(inputs),
      new Set(outputs),
      new Set(transitions)
    );
  }
}
