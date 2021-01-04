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
  @Input()
  public component: RobustUiComponent;
  public modelCheckerResult: BehaviorSubject<string> = new BehaviorSubject<string>("");


  private channels: Map<string, string> = new Map<string, string>();
  private missingChannels: Map<string, ChannelWithSymbol> = new Map<string, ChannelWithSymbol>();
  private modelString = "";
  private counter = 0;

  constructor(private electronService: ElectronService) {
    this.modelCheckerResult = this.electronService.modelCheckerResult;
  }

  public verifyComponent(): void {
    this.createModelForComponent(this.component);

    if (this.shouldGenerateEnvironment()) {
      this.modelString += this.generateEnvironment();
    }
    console.log(this.modelString);
    this.electronService.writeModelToFile(this.modelString);
    this.electronService.executeSpinFlow();
  }

  private createModelForComponent(component: RobustUiComponent) {
    component.inputs.forEach(this.createChannelAndDefine.bind(this));
    component.outputs.forEach(this.createChannelAndDefine.bind(this));

    this.modelString += "\nactive proctype " + component.label + "() {\n";
    this.modelString += "goto " + component.initialState.label + ";\n";

    component.states.forEach((state: RobustUiState) => {
      this.modelString += state.label + ":\n";
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
    this.modelString += "}\n";
  }

  private generateTransition(transitions: string[]) {
    if (transitions.length > 1) {
      this.modelString += "if\n";
      transitions.forEach((value) => {
        this.modelString += ":: " + value;
      });
      this.modelString += "fi\n";
    } else {
      transitions.forEach((value) => {
        this.modelString += value;
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
      this.modelString += "#define " + input + " " + this.counter.toString() + "\n";
      this.modelString += "chan " + channel + " = [0] of { byte }\n";
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
}
