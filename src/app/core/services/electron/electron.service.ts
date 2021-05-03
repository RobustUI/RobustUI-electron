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
import {SerializerFactory} from "../../../serializers/SerializerFactory";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  public modelCheckerResult: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public compilerResult: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private ajv = new Ajv();
  private readonly componentSchemas: any[];

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  process: typeof process;
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
      this.process = window.require('process');
      // If you wan to use remote object, pleanse set enableRemoteModule to true in main.ts
      // this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.componentSchemas = this.readAllJSONFilesInFolder<any>('src/app/schemas/');
    }
  }

  public readSingleJSONFileReturnContent<T>(filePath: string): T {
    let json: T;

    try {
      const rawData = this.fs.readFileSync(filePath);
      json = JSON.parse(rawData.toString());
    } catch (e) {
      return null;
    }

    return json;
  }

  public readAllJSONFilesInFolder<T>(folderPath: string): T[] {
    const files: T[] = [];
    let hasError = false;
    this.fs.readdirSync(folderPath).forEach(file => {
      const component = this.readSingleJSONFileReturnContent<T>(folderPath + "/" + file);
      if (component != null) {
        files.push(component);
      } else {
        hasError = true;
      }
    });
    if (hasError) {
      alert("Some files could not be loaded");
    }
    return files;
  }

  public readAllProject(folderPath: string): JsonRobustUIComponent[] {
    const files = this.readAllJSONFilesInFolder<JsonRobustUIComponent>(folderPath);
    const elements: JsonRobustUIComponent[] = [];
    const componentErrors: string[] = [];
    for (const file of files) {
      const schema = this.componentSchemas.find(e => e.title == file.type);

      if (this.ajv.validate(schema, file)) {
        elements.push(file);
      } else {
        componentErrors.push(file.label);
      }
    }

    if (componentErrors.length > 0) {
      this.alertComponentsNotCorrectSchemas(componentErrors);
    }

    return elements;
  }

  public writeComponentToJSON(component: RobustUiComponent, path: string): void {
    this.fs.writeFileSync(
      path + "/component" + component.label + ".json",
      SerializerFactory.forType(component.type).toJSON(component),
      'utf-8'
    );
  }

  public executeSpinFlow(componentFileName: string): void {
    let command = "";

    if (this.process.platform === "win32") {
      command = `"./bin/RobustUi--compiler/bin/RobustUi--compiler" -t promela -i C:\\Users\\mikke\\OneDrive\\Skrivebord\\RobustUI-electron\\src\\app\\JSON "${componentFileName}" > "./bin/spin/model.pml" && cd bin/spin && spin -search model.pml`;
    } else if (this.process.platform === "linux") {
      command = `./bin/RobustUi--compiler/bin/RobustUi--compiler -t promela -i /home/morten/Projects/RobustUI-electron/src/app/JSON  "${componentFileName}" > ./bin/spin/model.pml && ./bin/spin/spin -search ./bin/spin/model.pml`;
    } else {
      throw Error("Unsupported platform " + this.process.platform);
    }
    this.childProcess.exec(command, (
      (error, stdout) => {
        if (error == null) {
          this.modelCheckerResult.next(stdout);
        } else {
          this.modelCheckerResult.next(error.message);
        }
      }));
  }

  public executeCompiler(target: 'typescript' | 'treeant' | 'qtree' | 'promela', componentFileName: string) {
    let command = "";

    if (this.process.platform === "win32") {
      command = `"./bin/RobustUi--compiler/bin/RobustUi--compiler" -t ${target} -i C:\\Users\\mikke\\OneDrive\\Skrivebord\\RobustUI-electron\\src\\app\\JSON "${componentFileName}"`;
    } else if (this.process.platform === 'linux') {
      command = `./bin/RobustUi--compiler/bin/RobustUi--compiler -t ${target} -i /home/morten/Projects/RobustUI-electron/src/app/JSON "${componentFileName}"`;
    } else {
      throw Error("Unsupported platform " + this.process.platform);
    }
    this.childProcess.exec(command, (error, stdout) => {
      if (error == null) {
        this.compilerResult.next(stdout);
      } else {
        this.compilerResult.next(error.message);
      }
    });
  }

  private alertComponentsNotCorrectSchemas(componentErrors: string[]) {
    let componentNames = "";
    componentErrors.forEach(e => componentNames += e + ", ");
    componentNames = componentNames.slice(0, -2);
    alert("The following components does not conform to the schemas: " + componentNames);
  }
}
