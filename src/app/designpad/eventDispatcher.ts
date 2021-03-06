import {Observable, Subject} from "rxjs";

export enum EventType {
  STATE_EXPANSION,
  STATE_SHRINK,
  SWITCH_TOOL,
  SHOW_SETTINGS,
  SAVE_COMPONENT,
  CHANGE_COMPONENT,
  RENAME_STATE,
  RENAME_ACTION,
  DELETE_ACTION,
  REBUILD_AND_SAVE,
  ENABLE_MOUSE_EVENTS,
  DISABLE_MOUSE_EVENTS,
}

export interface Event {
  type: EventType;
  data: any;
}

export class EventDispatcher {
  private static instance = new EventDispatcher();
  private eventSubject: Subject<Event> = new Subject<Event>();

  private constructor() { }

  public static getInstance(): EventDispatcher {
    return this.instance;
  }

  public emit(event: Event): void {
    this.eventSubject.next(event);
  }

  public stream(): Observable<Event> {
    return this.eventSubject.asObservable();
  }
}
