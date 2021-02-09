import {Injectable} from '@angular/core';
import Ajv from "ajv";
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, remote, webFrame} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import {BehaviorSubject} from "rxjs";
import {JsonRobustUIComponent} from "../../../interfaces/jsonRobustUIComponent";
import {RobustUiComponent} from "../../../entities/robust-ui-component";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  public modelCheckerResult: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private spinModelFileName = "model.pml";
  private ajv = new Ajv();
  private readonly componentSchema;

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      // If you wan to use remote object, pleanse set enableRemoteModule to true in main.ts
      // this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      const componentSchemaRaw = this.fs.readFileSync("src/app/schema.json");
      this.componentSchema = JSON.parse(componentSchemaRaw.toString());
    }
  }

  public readJSONFileReturnContent(filePath: string): JsonRobustUIComponent {
    let json: JsonRobustUIComponent;

    try {
      const rawData = this.fs.readFileSync(filePath);
      json = JSON.parse(rawData.toString());
    } catch (e) {
      return null;
    }

    if (!this.ajv.validate(this.componentSchema, json)) {
      return null;
    }

    return json;
  }

  public readAllJSONFilesInFolder(folderPath: string): JsonRobustUIComponent[] {
    const components: JsonRobustUIComponent[] = [];
    this.fs.readdirSync(folderPath).forEach(file => {
      const component = this.readJSONFileReturnContent(folderPath + "/" + file);
      if (component != null) {
        components.push(this.readJSONFileReturnContent(folderPath + "/" + file));
      }
    });
    return components;
  }

  public writeComponentToJSON(component: RobustUiComponent, path: string): void {
    this.fs.writeFileSync(
      path + "/component" + component.label + ".json",
      RobustUiComponent.toJSON(component),
      'utf-8'
    );
  }

  public writeModelToFile(value: string): void {
    try {
      this.fs.writeFileSync(this.spinModelFileName, value, 'utf-8');
    } catch (e) {
      alert('Failed to save the file !');
    }
  }

  public executeSpinFlow(): void {
    this.childProcess.exec(`spin -a ${this.spinModelFileName} && gcc -o pan pan.c && pan.exe`, (
      (error, stdout) => {
        if (error == null) {
          this.modelCheckerResult.next(stdout);
        } else {
          this.modelCheckerResult.next("Something went wrong");
        }
      }));
  }
}
