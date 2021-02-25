import {Component, Input} from '@angular/core';
import {RobustUiComponent} from "../entities/robust-ui-component";
import {RobustUiState} from "../entities/robust-ui-state";
import {ElectronService} from "../core/services";
import {BehaviorSubject} from "rxjs";
import {RobustUiSimpleComponent} from "../entities/robust-ui-simple-component";
import {RobustUiStateTypes} from "../entities/robust-ui-state-types";
import {RobustUiCompositeComponent} from "../entities/robust-ui-composite-component";
import {ComponentRepository} from "../componentRepository";
import {RobustUiSelectiveComponent} from "../entities/robust-ui-selective-component";

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
  public model = false;

  private channels: Map<string, string> = new Map<string, string>();
  private missingChannels: Map<string, ChannelWithSymbol> = new Map<string, ChannelWithSymbol>();
  private modelString = "";
  private counter = 0;

  constructor(
    private electronService: ElectronService,
    private componentRepository: ComponentRepository
  ) {
    this.modelCheckerResult = this.electronService.modelCheckerResult;
  }

  public verifyComponent(): void {
    this.createModelString(this.component);

    if (this.shouldGenerateEnvironment()) {
      this.modelString += this.generateEnvironment();
    }
    this.electronService.writeModelToFile(this.modelString);
    this.electronService.executeSpinFlow();
  }

  public closeModelAndReset(value: boolean): void {
    this.model = value;
    this.reset();
  }

  private reset() {
    this.modelString = "";
    this.channels.clear();
    this.missingChannels.clear();
    this.counter = 0;
    this.modelCheckerResult.next("");
  }

  private createModelString(component: RobustUiComponent, nickname?: string): void {
    switch (component.type) {
      case RobustUiStateTypes.simpleComponent:
        this.createModelForSimpleComponent(component as RobustUiSimpleComponent, nickname);
        break;
      case RobustUiStateTypes.compositeComponent:
        this.createModelForCompositeComponent(component as RobustUiCompositeComponent);
        break;
      case RobustUiStateTypes.selectiveComponent:
        this.createModelForSelectiveComponent(component as RobustUiSelectiveComponent);
        break;
      default:
        throw new Error("Type is not supported: " + component.type.toString());
    }
  }

  private createModelForCompositeComponent(compositeComponent: RobustUiCompositeComponent) {
    const allComponent = this.componentRepository.snapshot;
    compositeComponent.components.forEach((label, key) => {
      const component = allComponent.find(c => c.label === label);
      this.createModelString(component, key);
    });
  }

  private createModelForSelectiveComponent(component: RobustUiSelectiveComponent) {
    const variable = component.observer.input;
    this.modelString += "byte " + variable + "\n";
    this.modelString += "\nactive proctype " + ModelCheckerComponent.replaceSpace(component.label) + "() {\nend:\n";
    this.modelString += variable + "++;\nif\n";

    component.cases.forEach((singleCase) => {
      this.modelString += ":: " + variable + singleCase.guard + " -> goto end;\n";
    });
    this.modelString += "fi\n}\n";
  }

  private createModelForSimpleComponent(component: RobustUiSimpleComponent, nickname?: string) {
    component.inputs.forEach(this.createChannelAndDefine.bind(this));
    component.outputs.forEach(this.createChannelAndDefine.bind(this));

    if (nickname != null) {
      this.modelString += "\nactive proctype " + ModelCheckerComponent.replaceSpace(nickname) + "() {\n";
    } else {
      this.modelString += "\nactive proctype " + ModelCheckerComponent.replaceSpace(component.label) + "() {\n";
    }
    this.modelString += "goto " + ModelCheckerComponent.replaceSpace(component.initialState.label) + ";\n";

    component.states.forEach((state: RobustUiState) => {
      this.modelString += ModelCheckerComponent.replaceSpace(state.label) + ":\n";
      const transitions: string[] = [];
      component.transitions.forEach((v) => {
        if (v.from === state.label) {
          if (component.inputs.has(v.label)) {
            const replacedLabel = this.channels.get(ModelCheckerComponent.replaceSpace(v.label));
            transitions.push(replacedLabel + "?" + ModelCheckerComponent.replaceSpace(v.label) + " -> goto " + ModelCheckerComponent.replaceSpace(v.to) + "\n");
            this.addOrRemoveMissingChannel(v.label, true);
          } else if (component.outputs.has(v.label)) {
            const replacedLabel = this.channels.get(ModelCheckerComponent.replaceSpace(v.label));
            transitions.push(replacedLabel + "!" + ModelCheckerComponent.replaceSpace(v.label) + " -> goto " + ModelCheckerComponent.replaceSpace(v.to) + "\n");
            this.addOrRemoveMissingChannel(v.label, false);
          } else {
            transitions.push("goto " + ModelCheckerComponent.replaceSpace(v.to) + "\n");
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
    if (this.hasChannelWithCorrectSymbol(channel, send)) {
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

  private hasChannelWithCorrectSymbol(channel, send: boolean): boolean {
    if (this.missingChannels.has(channel)) {
      const channelWithSymbol = this.missingChannels.get(channel);
      if (send) {
        return channelWithSymbol.symbol !== "!";
      } else {
        return channelWithSymbol.symbol !== "?";
      }
    }
    return false;
  }

  private createChannelAndDefine(input: string) {
    if (!this.channels.has(input)) {
      const replacedInput = ModelCheckerComponent.replaceSpace(input);
      const channel = replacedInput + "Channel";
      this.channels.set(replacedInput, channel);
      this.modelString += "#define " + replacedInput + " " + this.counter.toString() + "\n";
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
      const replacedLabel = this.channels.get(ModelCheckerComponent.replaceSpace(channel.label));
      environment += ":: " + replacedLabel + channel.symbol + ModelCheckerComponent.replaceSpace(channel.label) + " -> goto end;\n";
    });
    environment += "fi\n}\n";

    return environment;
  }

  private static replaceSpace(value: string): string {
    return value.split(' ').join('_');
  }
}
