import {Injectable} from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, webFrame, remote} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  public result: BehaviorSubject<string> = new BehaviorSubject<string>("");

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
    }
  }

  public writeModelToFile(value: string): void {
    try {
      this.fs.writeFileSync('model.pml', value, 'utf-8');
    } catch (e) {
      alert('Failed to save the file !');
    }
  }

  public executeSpinFlow(): void {
    this.childProcess.exec("spin -a model.pml && gcc -o pan pan.c && pan.exe", (
      (error, stdout) => {
        if (error == null) {
          this.result.next(stdout);
        } else {
          this.result.next("Something went wrong");
        }
      }));
  }
}
