import {Triple} from "../../elements/triple";
import * as P5 from 'p5';
import {Point} from "../../elements/point";
import {BasicState} from "../../elements/basicState";
import {Transition} from "../../elements/transition";
import {caseComponent} from "../../elements/selectiveComponent";

export interface Grid {
  rows: number,
  columns: number
}

export class GridBuilder {
  public static drawElementsInGrid(elements: any[], canvasWidth: number, canvasHeight: number, startPosition: Point, pad: P5, drawLevel: number, cameraPosition: Triple) {
    const grid = GridBuilder.getGridLayout((elements.length === 1) ? elements.length + 1 : elements.length);
    const padding = 5;
    const length = grid.columns;
    const width = (canvasWidth / grid.columns) - (2 * padding);
    const height = (canvasHeight/ grid.rows);
    elements.forEach((obj, index) => {
      const xFactor = Math.floor(index % length);
      const yFactor = Math.floor(index / length);
      pad.push();
      pad.textSize(pad.textSize() / drawLevel);
      const translateX = startPosition.x + (width * xFactor) + (xFactor * (2 * padding)) + padding;
      const translateY = startPosition.y + (height * yFactor)  + (yFactor * (2 * padding)) + padding;
      pad.translate(translateX, translateY);
      obj.position = {x: 0, y: 0, width: width, height: height, drawLevel: drawLevel};
      obj.translateScaleForMouseInteraction = {x: translateX, y: translateY};
      obj.constrainedDraw = true;
      obj.draw(cameraPosition);
      pad.pop();
    });
  }

  public static drawGridLayout(pad: P5, startPosition: Point, columns: number, width: number, height: number) {
    const grid = GridBuilder.getGridLayout(columns);
    pad.push();
    pad.translate(startPosition.x, startPosition.y);
    pad.stroke('#c9c9c9c9');
    for (let i = 1; i < grid.columns; i++) {
      pad.line((width/grid.columns) * i, 0, (width/grid.columns) * i, height);
    }

    for (let i = 1; i < grid.rows; i++) {
      pad.line(0, (height/grid.rows) * i, width, (height/grid.rows) * i);
    }
    pad.pop();
  }

  public static drawSelectiveElementsLayout(elements: caseComponent[], canvasWidth: number, canvasHeight: number, startPosition: Point, pad: P5, drawLevel: number, cameraPosition: Triple) {
    const padding = 5;
    const length = elements.length;
    const width = (canvasWidth /2) - (2 * padding);
    const height = (canvasHeight/ length);


    pad.push();
    pad.translate(startPosition.x, startPosition.y);
    pad.push();
    pad.fill("#000000");
    const indicator = new BasicState(pad, "", 20, 20, 20);
    indicator.draw(cameraPosition);
    pad.pop();
    elements.forEach((obj, index) => {
      pad.push();
      pad.textSize(pad.textSize() / drawLevel);
      const translateX = width + padding;
      const translateY = ((height * index) + ((2 * padding) * index)) + padding;
      pad.translate(translateX, translateY);
      obj.component.position = {x: 0, y: 0, width: width, height: height, drawLevel: drawLevel};
      obj.component.translateScaleForMouseInteraction = {x: translateX, y: translateY};
      obj.component.constrainedDraw = true;
      obj.component.draw(cameraPosition);
      pad.pop();
      const transition = new Transition(pad, obj.expression, indicator, obj.component, 'l');
      transition.draw(cameraPosition);
    });
    pad.pop();
  }

  public static drawColumnLayout(pad: P5, startPosition: Point, rows: number, width: number, height: number) {
    pad.push();
    pad.translate(startPosition.x, startPosition.y);
    pad.stroke('#c9c9c9c9');

    pad.line(0, 0, 0, height);

    for (let i = 1; i < rows; i++) {
      pad.line(0, (height/rows) * i, width, (height/rows) * i);
    }
    pad.pop();
  }

  private static getGridLayout(columns: number): Grid {
    const n = columns;
    const r = Math.floor(Math.sqrt(n));
    let c = Math.floor(n/r);

    if (n != r*c) {
      c += 1;
    }

    return {rows: r, columns: c};
  }
}
